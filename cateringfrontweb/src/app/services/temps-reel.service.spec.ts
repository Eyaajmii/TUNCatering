import { TestBed } from '@angular/core/testing';

import { TempsReelService } from './temps-reel.service';

describe('TempsReelService', () => {
  let service: TempsReelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TempsReelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
