import { ComponentFixture, TestBed } from '@angular/core/testing';

import { REngineeringComponent } from './rengineering.component';

describe('REngineeringComponent', () => {
  let component: REngineeringComponent;
  let fixture: ComponentFixture<REngineeringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [REngineeringComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(REngineeringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
