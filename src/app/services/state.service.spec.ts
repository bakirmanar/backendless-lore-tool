import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { AppState, StorageKeys, OWNER_USERNAME } from '@app/models';
import { StateService } from './state.service';
import { StorageService } from './storage/storage.service';

describe('StateService', () => {
  let service: StateService;
  let storageService: jasmine.SpyObj<StorageService>;
  let state: AppState;

  beforeEach(async () => {
    storageService = jasmine.createSpyObj<StorageService>('StorageService', ['get', 'set']);
    storageService.get.and.resolveTo(null);
    storageService.set.and.resolveTo();
    TestBed.configureTestingModule({
      providers: [{ provide: StorageService, useValue: storageService }],
    });
    service = TestBed.inject(StateService);
    await firstValueFrom(service.initialized$);
    state = {
      currentUser: { id: 'owner', name: 'OWNER', password: 'password', access: [] },
      articles: [],
      ownerData: {
        accessTags: [{ id: 'tag', name: 'Original' }],
        users: [],
      },
    };
    service.state = state;
    storageService.set.calls.reset();
  });

  describe('initialization', () => {
    it('replays completion without reading storage again or restoring old state', async () => {
      await firstValueFrom(service.initialized$);
      await firstValueFrom(service.initialized$);
      expect(storageService.get).toHaveBeenCalledTimes(1);
      expect(service.state).toBe(state);
    });
  });

  describe('users', () => {
    beforeEach(() => {
      state.ownerData!.users = [
        { ...state.currentUser! },
        { id: 'reader', name: 'Reader', password: 'reader-password', access: ['tag'] },
      ];
      service.state = state;
      storageService.set.calls.reset();
    });

    it('creates and persists users without retaining mutable draft tags', async () => {
      const user = { id: 'new', name: ' New user ', password: 'new-password', access: ['tag'] };
      await service.saveUser(user, true);
      user.access.length = 0;
      expect(service.users()[2]).toEqual({ ...user, name: 'New user', access: ['tag'] });
      expect(storageService.set).toHaveBeenCalledWith(StorageKeys.APP_STATE, service.state);
    });

    it('updates owner credentials in both records while preserving owner tags', async () => {
      await service.saveUser({ ...state.currentUser!, password: 'changed', access: ['tag'] }, false);
      expect(service.state.currentUser).toEqual(service.users()[0]);
      expect(service.users()[0].name).toBe(OWNER_USERNAME);
      expect(service.users()[0].password).toBe('changed');
      expect(service.users()[0].access).toEqual([]);
    });

    it('rejects owner renaming and the reserved username for other users', async () => {
      await expectAsync(service.saveUser({ ...state.currentUser!, name: 'Renamed' }, false)).toBeRejected();
      await expectAsync(service.saveUser({ ...state.ownerData!.users[1], name: OWNER_USERNAME }, false)).toBeRejected();
      await expectAsync(service.saveUser({ id: 'new', name: OWNER_USERNAME, password: 'unique', access: [] }, true)).toBeRejected();
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('rejects duplicate passwords, names and unknown tags', async () => {
      const user = { id: 'new', name: 'New', password: 'unique', access: [] };
      await expectAsync(service.saveUser({ ...user, password: 'reader-password' }, true)).toBeRejected();
      await expectAsync(service.saveUser({ ...user, name: ' reader ' }, true)).toBeRejected();
      await expectAsync(service.saveUser({ ...user, access: ['missing'] }, true)).toBeRejected();
      expect(storageService.set).not.toHaveBeenCalled();
    });

    it('prevents owner deletion and deletes regular users', async () => {
      await expectAsync(service.removeUser('owner')).toBeRejected();
      await service.removeUser('reader');
      expect(service.users().map((user) => user.id)).toEqual(['owner']);
    });

    it('retains state when storage rejects a save', async () => {
      storageService.set.and.rejectWith(new Error('Storage unavailable'));
      await expectAsync(service.removeUser('reader')).toBeRejected();
      expect(service.state).toBe(state);
    });

    it('rejects user mutations without owner authorization', async () => {
      service.state = { currentUser: null, articles: [] };
      await expectAsync(service.removeUser('reader')).toBeRejected();
      await expectAsync(service.saveUser({ id: 'new', name: 'New', password: 'unique', access: [] }, true)).toBeRejected();
    });
  });

  describe('access tags', () => {
    it('persists renamed and added tags without changing their IDs or other owner data', () => {
      const tags = [{ id: 'tag', name: ' Renamed ' }, { id: 'new', name: 'New' }];
      expect(service.setAccessTags(tags)).toBeTrue();
      expect(service.state.ownerData?.accessTags).toEqual([
        { id: 'tag', name: 'Renamed' }, { id: 'new', name: 'New' },
      ]);
      expect(service.state.ownerData?.users).toBe(state.ownerData!.users);
      expect(storageService.set).toHaveBeenCalledWith(StorageKeys.APP_STATE, service.state);
      tags[0].name = 'Changed draft';
      expect(service.state.ownerData?.accessTags[0].name).toBe('Renamed');
    });
  
    it('allows removing unused tags', () => {
      expect(service.setAccessTags([])).toBeTrue();
      expect(service.state.ownerData?.accessTags).toEqual([]);
    });
  
    it('rejects blank names and duplicate IDs without persisting', () => {
      expect(service.setAccessTags([{ id: 'tag', name: '  ' }])).toBeFalse();
      expect(service.setAccessTags([{ id: 'tag', name: 'A' }, { id: 'tag', name: 'B' }])).toBeFalse();
      expect(storageService.set).not.toHaveBeenCalled();
    });
  
    for (const usage of ['article', 'section', 'user']) {
      it(`prevents deleting a tag referenced by a ${usage}`, () => {
        state.articles = [{
          id: 'article', title: 'Article', accessTags: usage === 'article' ? ['tag'] : [],
          sections: [{ id: 'section', content: 'Private', accessTags: usage === 'section' ? ['tag'] : [] }],
        }];
        state.ownerData!.users = [{ id: 'reader', name: 'Reader', password: 'password', access: usage === 'user' ? ['tag'] : [] }];
        service.state = state;
        storageService.set.calls.reset();
        expect(service.setAccessTags([])).toBeFalse();
        expect(storageService.set).not.toHaveBeenCalled();
      });
    }
  
    it('rejects edits after owner authorization is lost', () => {
      service.state = { currentUser: null, articles: [] };
      storageService.set.calls.reset();
      expect(service.setAccessTags([{ id: 'new', name: 'New' }])).toBeFalse();
      expect(storageService.set).not.toHaveBeenCalled();
    });
  });
});
