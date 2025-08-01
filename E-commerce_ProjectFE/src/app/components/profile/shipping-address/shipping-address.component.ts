import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shipping-address',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './shipping-address.component.html',
  styleUrls: ['./shipping-address.component.css']
})
export class ShippingAddressComponent {
  @Input() shippingAddresses: string[] = [];
  newAddress: string = '';

  addAddress() {
    if (this.newAddress.trim()) {
      this.shippingAddresses.push(this.newAddress.trim());
      this.newAddress = '';
    }
  }

  removeAddress(index: number) {
    this.shippingAddresses.splice(index, 1);
  }
}
