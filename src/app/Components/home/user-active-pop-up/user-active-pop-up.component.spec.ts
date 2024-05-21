import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserActivePopUpComponent } from './user-active-pop-up.component';

describe('UserActivePopUpComponent', () => {
  let component: UserActivePopUpComponent;
  let fixture: ComponentFixture<UserActivePopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserActivePopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UserActivePopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
