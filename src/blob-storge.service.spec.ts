import { TestBed } from '@angular/core/testing';

import { BlobStorgeService } from './blob-storge.service';

describe('BlobStorgeService', () => {
  let service: BlobStorgeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlobStorgeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
