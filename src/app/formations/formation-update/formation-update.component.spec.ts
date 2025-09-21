import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormationUpdateComponent } from './formation-update.component';

describe('FormationUpdateComponent', () => {
  let component: FormationUpdateComponent;
  let fixture: ComponentFixture<FormationUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FormationUpdateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormationUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
