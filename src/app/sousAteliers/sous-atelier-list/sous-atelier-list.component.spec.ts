import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SousAtelierListComponent } from './sous-atelier-list.component';

describe('SousAtelierListComponent', () => {
  let component: SousAtelierListComponent;
  let fixture: ComponentFixture<SousAtelierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SousAtelierListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SousAtelierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
