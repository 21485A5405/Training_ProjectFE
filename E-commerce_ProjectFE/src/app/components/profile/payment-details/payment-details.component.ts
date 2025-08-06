import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profileservice';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-details.component.html',
  styleUrls: ['./payment-details.component.css']
})
export class PaymentDetailsComponent implements OnInit {
  @Input() paymentDetails: any = {}; 

  paymentMethods: string[] = [];

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.fetchPaymentMethods();
  }

  fetchPaymentMethods(): void {
    this.profileService.getPaymentEnums().subscribe(
      (data: string[]) => {
        this.paymentMethods = data;
      },
      (error) => {
        console.error('Error fetching payment enums', error);
      }
    );
  }
}
