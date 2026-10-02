import { TestBed } from '@angular/core/testing';
import { OWNER_USERNAME } from '@app/models';

import { BundleCryptoService } from './bundle-crypto.service';

describe('BundleCryptoService', () => {
  let service: BundleCryptoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BundleCryptoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('assigns owner access by the reserved username rather than the current user ID', async () => {
    const owner = { id: 'owner', name: 'OWNER', password: 'owner-secret', access: [] };
    const reader = { id: 'reader', name: 'Reader', password: 'reader-secret', access: [] };
    const bundle = await service.encrypt({
      currentUser: reader,
      ownerData: { users: [owner, reader], accessTags: [{ id: 'tag', name: 'Private' }] },
      articles: [{ id: 'article', title: 'Secret', accessTags: ['tag'], sections: [] }],
    });
    const ownerState = await service.decrypt(bundle!, owner.password);
    expect(ownerState?.ownerData?.users[0].name).toBe(OWNER_USERNAME);
    expect(ownerState?.articles.length).toBe(1);
    const readerState = await service.decrypt(bundle!, reader.password);
    expect(readerState?.ownerData).toBeUndefined();
    expect(readerState?.articles).toEqual([]);
  });
});
