import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousAtelierFormComponent } from './sous-atelier-form.component';

describe('SousAtelierFormComponent', () => {
  let component: SousAtelierFormComponent;
  let fixture: ComponentFixture<SousAtelierFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SousAtelierFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SousAtelierFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
