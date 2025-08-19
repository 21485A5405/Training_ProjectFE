import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePaymentDialogcomponent } from './update-payment-dialogcomponent';

describe('UpdatePaymentDialogcomponent', () => {
  let component: UpdatePaymentDialogcomponent;
  let fixture: ComponentFixture<UpdatePaymentDialogcomponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePaymentDialogcomponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdatePaymentDialogcomponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

