import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesADDComponent } from './images-add.component';

describe('ImagesADDComponent', () => {
  let component: ImagesADDComponent;
  let fixture: ComponentFixture<ImagesADDComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagesADDComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagesADDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
