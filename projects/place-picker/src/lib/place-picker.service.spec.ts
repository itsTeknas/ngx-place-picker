import { TestBed } from '@angular/core/testing';

import { PlacePickerService } from './place-picker.service';

describe('PlacePickerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PlacePickerService = TestBed.get(PlacePickerService);
    expect(service).toBeTruthy();
  });
});
