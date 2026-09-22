import { TestBed } from '@angular/core/testing';

import { StateImportExportService } from './state-import-export.service';

describe('StateImportExportService', () => {
  let service: StateImportExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StateImportExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
