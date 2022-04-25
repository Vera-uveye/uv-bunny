import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BunnyDetailsComponent } from './bunny-details.component';

describe('BunnyDetailsComponent', () => {
  let component: BunnyDetailsComponent;
  let fixture: ComponentFixture<BunnyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BunnyDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BunnyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
