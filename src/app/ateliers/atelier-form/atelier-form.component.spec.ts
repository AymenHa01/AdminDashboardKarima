import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtelierFormComponent } from './atelier-form.component';

describe('AtelierFormComponent', () => {
  let component: AtelierFormComponent;
  let fixture: ComponentFixture<AtelierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtelierFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AtelierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
