import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImagesModelsComponent } from './images-models.component';

describe('ImagesModelsComponent', () => {
  let component: ImagesModelsComponent;
  let fixture: ComponentFixture<ImagesModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ImagesModelsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImagesModelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
