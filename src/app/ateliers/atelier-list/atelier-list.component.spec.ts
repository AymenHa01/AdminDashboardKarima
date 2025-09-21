import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AtelierListComponent } from './atelier-list.component';

describe('AtelierListComponent', () => {
  let component: AtelierListComponent;
  let fixture: ComponentFixture<AtelierListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AtelierListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AtelierListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
