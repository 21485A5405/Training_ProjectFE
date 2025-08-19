import Swal from "sweetalert2";
import { CartService } from "../../../services/cartservice";
import { ProfileService } from "../../../services/profileservice";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OrderService } from "../../../services/orderservice";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { Pipe } from "@angular/core";

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css'],
})
export class CartPageComponent implements OnInit {
  cartItems: any[] = [];
  userId: number = 0;
  isLoading: boolean = true;
  selectedItems: any[] = [];
  userAddresses: any[] = [];
  selectedAddressId: number = 0;

  totalItemsCount: number = 0;
  totalPrice: number = 0;
  selectedItemsCount: number = 0;
  selectedItemsTotal: number = 0;
  shippingCost: number = 5.00;

  paymentOption: 'PAY_NOW' | 'CASH_ON_DELIVERY' = 'CASH_ON_DELIVERY';

  showAddAddressForm: boolean = false;
  showAddPaymentForm: boolean = false;
  newAddress: string = '';
  newPaymentMethod: string = '';
  newAccountDetails: string = '';
  paymentEnums: string[] = [];
  selectedPaymentMethod: string = '';
  selectedAccountDetails: string = '';
  userPaymentMethods: any[] = [];
  selectedSavedPayment: any = null;
  showAddNewPayment: boolean = false;

  constructor(
    private cartService: CartService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private orderService: OrderService,
    private http: HttpClient,
    private router: Router
  ) { }

  ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('userId');
    this.userId = storedUserId ? +storedUserId : 0;
    this.fetchCartItems();
    this.getAddresses();
    this.getPaymentEnums();
    this.loadUserPaymentMethods();
  }

  getPaymentEnums(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: token });

    this.http.get<string[]>('http://localhost:8080/users/get-payment-methods', { headers }).subscribe({
      next: (enums) => {
        this.paymentEnums = enums;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching payment enums:', err)
    });
  }

  toggleAddAddressForm(): void {
    this.showAddAddressForm = !this.showAddAddressForm;
    if (this.showAddAddressForm) {
      this.showAddPaymentForm = false;
    }
  }

  toggleAddPaymentForm(): void {
    this.showAddPaymentForm = !this.showAddPaymentForm;
    if (this.showAddPaymentForm) {
      this.showAddAddressForm = false;
    }
  }

  addNewAddress(): void {
    if (!this.newAddress.trim()) {
      Swal.fire('Error', 'Please enter a valid address.', 'error');
      return;
    }

    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });

    const addressData = {
      userId: this.userId,
      fullAddress: this.newAddress
    };

    this.http.post(`http://localhost:8080/users/add-address`, addressData, {
      headers,
      responseType: 'text'
    }).subscribe({
      next: () => {
        Swal.fire('Success', 'Address added successfully!', 'success');
        this.getAddresses();
        this.newAddress = '';
        this.showAddAddressForm = false;
      },
      error: (err) => {
        console.error('Error adding address:', err);
        Swal.fire('Error', 'Failed to add address', 'error');
      }
    });
  }

  getAddresses(): void {
    this.profileService.getUserAddresses(this.userId).subscribe({
      next: (addresses: any) => {
        this.userAddresses = addresses;
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error fetching addresses:', err)
    });
  }

  fetchCartItems(): void {
    this.isLoading = true;
    this.cartService.getCartItems(this.userId).subscribe({
      next: (response: any) => {
        this.cartItems = response.data || response;
        this.calculateTotals();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Error fetching cart items:', err);
        this.isLoading = false;
      }
    });
  }

  calculateTotals(): void {
    this.totalItemsCount = this.cartItems.reduce((sum, item) => sum + item.productQuantity, 0);
    this.totalPrice = this.cartItems.reduce((sum, item) => sum + (item.product.productPrice * item.productQuantity), 0);
    this.selectedItemsCount = this.selectedItems.reduce((sum, item) => sum + item.productQuantity, 0);
    this.selectedItemsTotal = this.selectedItems.reduce((sum, item) => sum + (item.product.productPrice * item.productQuantity), 0);
  }

  onAddressChange(): void {
    
    this.paymentOption = 'CASH_ON_DELIVERY';
    this.selectedPaymentMethod = '';
    this.selectedAccountDetails = '';
    this.selectedSavedPayment = null;
    this.showAddNewPayment = false;
    this.newPaymentMethod = '';
    this.newAccountDetails = '';
  }

  toggleSelection(item: any, event: any): void {
    if (event.target.checked) {
      this.selectedItems.push(item);
    } else {
      this.selectedItems = this.selectedItems.filter(selected => selected.cartItemId !== item.cartItemId);
    }
    this.calculateTotals();
  }

  deleteCartItem(cartItemId: number): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to remove this item from your cart?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, remove it!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cartService.deleteCartItem(cartItemId).subscribe({
          next: () => {
            this.fetchCartItems();
            Swal.fire('Removed!', 'Item has been removed from your cart.', 'success');
          },
          error: (err: any) => {
            console.error('Error deleting item:', err);
            Swal.fire('Error', 'Failed to remove item from cart.', 'error');
          }
        });
      }
    });
  }

  increaseQuantity(item: any): void {
    this.cartService.increaseCartQuantity(this.userId, item.product.productId).subscribe({
      next: () => this.fetchCartItems(),
      error: (err: any) => console.error('Error increasing quantity:', err)
    });
  }

  decreaseQuantity(item: any): void {
    if (item.productQuantity > 1) {
      this.cartService.decreaseCartQuantity(this.userId, item.product.productId).subscribe({
        next: () => this.fetchCartItems(),
        error: (err: any) => console.error('Error decreasing quantity:', err)
      });
    }
  }
  navigateToOrders() : void {
    this.router.navigate(['/home-page']);
  }

  selectPaymentOption(option: 'PAY_NOW' | 'CASH_ON_DELIVERY'): void {
    this.paymentOption = option;
    if (option === 'CASH_ON_DELIVERY') {
      this.selectedPaymentMethod = '';
      this.selectedAccountDetails = '';
      this.selectedSavedPayment = null;
      this.showAddNewPayment = false;
    }
  }

  onPaymentMethodChange(): void {
    this.selectedSavedPayment = null;
    this.selectedAccountDetails = '';
    this.showAddNewPayment = false;
    this.newPaymentMethod = this.selectedPaymentMethod;
    this.newAccountDetails = '';
  }

  onShippingChange(event: any): void {
    this.shippingCost = parseFloat(event.target.value);
    this.cdr.detectChanges();
  }

  updateShippingCost(cost: number): void {
    this.shippingCost = cost;
  }

  getFinalTotal(): number {
    return this.selectedItemsTotal + this.shippingCost;
  }

  getAllItemsTotal(): number {
    return this.totalPrice + this.shippingCost;
  }

  goToHome(): void {
    this.router.navigate(['/home-page']);
  }

  placeOrder(): void {
    
    const itemsToOrder = this.selectedItems.length > 0 ? this.selectedItems : this.cartItems;
    
    if (itemsToOrder.length === 0) {
      Swal.fire('Error', 'Your cart is empty. Please add items to place an order.', 'error');
      return;
    }

    if (!this.selectedAddressId) {
      Swal.fire('Error', 'Please select a shipping address.', 'error');
      return;
    }

    if (this.paymentOption === 'PAY_NOW' && (!this.selectedPaymentMethod || !this.selectedAccountDetails)) {
      Swal.fire('Error', 'Please select payment method and enter account details.', 'error');
      return;
    }

    
    const orderData = itemsToOrder.map(item => ({
      userId: this.userId,
      productId: item.product.productId,
      addressId: this.selectedAddressId,
      paymentType: this.selectedPaymentMethod || null, 
      quantity: item.productQuantity,
      paymentOption: this.paymentOption, 
      paymentStatus: this.paymentOption === 'PAY_NOW' ? 'PAID' : 'PENDING' 
    }));

    if (this.paymentOption === 'PAY_NOW') {
      const maskedDetails = this.maskAccountDetails(this.selectedAccountDetails);
      const paymentSource = this.selectedSavedPayment ? 'Saved Payment' : 'Manual Entry';
      const totalAmount = this.selectedItemsCount > 0 ? this.getFinalTotal() : this.getAllItemsTotal();
      
      Swal.fire({
        title: 'Processing Payment',
        html: `
          <div style="text-align: left; padding: 10px;">
            <p><strong>Payment Method:</strong> ${this.selectedPaymentMethod.replace('_', ' ')}</p>
            <p><strong>Account Details:</strong> ${maskedDetails}</p>
            <p><strong>Payment Source:</strong> ${paymentSource}</p>
            <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
            <p><strong>Items:</strong> ${orderData.length}</p>
          </div>
        `,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Confirm Payment',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.orderService.placeOrder(orderData).subscribe({
            next: () => {
              Swal.fire({
                title: 'Order Placed Successfully!',
                text: 'Your order has been placed and payment processed.',
                icon: 'success',
                timer: 5000,
                timerProgressBar: true,
                showCancelButton: true,
                confirmButtonText: 'Go to Home',
                cancelButtonText: 'Stay Here',
                willClose: () => {
                  this.router.navigate(['/home-page']);
                }
              }).then((result) => {
                if (result.isConfirmed) {
                  this.router.navigate(['/home-page']);
                }
              });
              this.fetchCartItems();
            },
            error: (err) => {
              console.error('Error placing order:', err);
              Swal.fire('Error', 'Failed to place order. Please try again.', 'error');
            }
          });
        }
      });
    } else {
      
      this.orderService.placeOrder(orderData).subscribe({
        next: () => {
          Swal.fire({
            title: 'Order Placed Successfully!',
            text: 'Your order has been placed. Payment will be collected on delivery.',
            icon: 'success',
            timer: 5000,
            timerProgressBar: true,
            showCancelButton: true,
            confirmButtonText: 'Go to Home',
            cancelButtonText: 'Stay Here',
            willClose: () => {
              this.router.navigate(['/home-page']);
            }
          }).then((result) => {
            if (result.isConfirmed) {
              this.router.navigate(['/home-page']);
            }
          });
          this.fetchCartItems();
        },
        error: (err) => {
          console.error('Error placing order:', err);
          Swal.fire('Error', 'Failed to place order. Please try again.', 'error');
        }
      });
    }
  }

  loadUserPaymentMethods(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: token });

    this.http.get<any[]>(`http://localhost:8080/users/get-user-payments/${this.userId}`, { headers }).subscribe({
      next: (methods) => {
        this.userPaymentMethods = methods;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching user payment methods', err),
    });
  }

  onSavedPaymentSelect(): void {
    if (this.selectedSavedPayment) {
      this.selectedAccountDetails = this.selectedSavedPayment.accountDetails;
      this.showAddNewPayment = false;
    } else {
      this.selectedAccountDetails = '';
    }
  }

  toggleAddNewPayment(): void {
    this.showAddNewPayment = !this.showAddNewPayment;
    if (this.showAddNewPayment) {
      this.selectedSavedPayment = null;
      this.selectedAccountDetails = '';
      this.newPaymentMethod = '';
      this.newAccountDetails = '';
    }
  }

  addNewPaymentMethod(): void {
    if (!this.newPaymentMethod || !this.newAccountDetails.trim()) {
      Swal.fire('Error', 'Please fill in all fields for the new payment method.', 'error');
      return;
    }

    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });

    const paymentData = {
      paymentMethod: this.newPaymentMethod,
      accountDetails: this.newAccountDetails
    };

    this.http.post(`http://localhost:8080/users/add-payment/${this.userId}`, paymentData, { headers }).subscribe({
      next: () => {
        Swal.fire('Success', 'Payment method added successfully!', 'success');
        this.loadUserPaymentMethods();
        
        this.selectedPaymentMethod = this.newPaymentMethod;
        this.selectedAccountDetails = this.newAccountDetails;
        
        this.newPaymentMethod = '';
        this.newAccountDetails = '';
        this.showAddNewPayment = false;
        this.selectedSavedPayment = null; 
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error adding payment method:', err);
        Swal.fire('Error', 'Failed to add payment method', 'error');
      }
    });
  }

  cancelAddNewPayment(): void {
    this.showAddNewPayment = false;
    this.newPaymentMethod = '';
    this.newAccountDetails = '';
  }

  getFilteredSavedPayments(): any[] {
    if (!this.selectedPaymentMethod) {
      return [];
    }
    return this.userPaymentMethods.filter(payment => 
      payment.paymentMethod === this.selectedPaymentMethod
    );
  }

  isUsingSavedPayment(): boolean {
    return this.selectedSavedPayment !== null;
  }

  maskAccountDetails(details: string): string {
    if (!details) return '';
    
    const paymentMethod = this.selectedPaymentMethod ||
      (this.selectedSavedPayment ? this.selectedSavedPayment.paymentMethod : '');

    if (paymentMethod === 'UPI') {
      // Return full UPI ID without masking
      return details;
    } else if (paymentMethod === 'CREDIT_CARD' || paymentMethod === 'DEBIT_CARD') {
      const cleaned = details.replace(/\D/g, '');
      if (cleaned.length >= 4) {
        return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
      }
      return details;
    } else if (paymentMethod === 'NET_BANKING') {
      if (details.length > 4) {
        return '*'.repeat(details.length - 4) + details.slice(-4);
      }
      return details;
    }
    
    return details;
  }

  getAccountDetailsLabel(): string {
    switch (this.selectedPaymentMethod) {
      case 'UPI': return 'UPI ID';
      case 'CREDIT_CARD': return 'Credit Card Number';
      case 'DEBIT_CARD': return 'Debit Card Number';
      case 'NET_BANKING': return 'Account Number';
      default: return 'Account Details';
    }
  }

  getAccountDetailsPlaceholder(): string {
    switch (this.selectedPaymentMethod) {
      case 'UPI': return 'Enter UPI ID (e.g., user@paytm)';
      case 'CREDIT_CARD': return 'Enter credit card number';
      case 'DEBIT_CARD': return 'Enter debit card number';
      case 'NET_BANKING': return 'Enter account number';
      default: return 'Enter account details';
    }
  }

  getNewPaymentPlaceholder(): string {
    switch (this.newPaymentMethod) {
      case 'UPI': return 'Enter UPI ID (e.g., user@paytm)';
      case 'CREDIT_CARD': return 'Enter credit card number';
      case 'DEBIT_CARD': return 'Enter debit card number';
      case 'NET_BANKING': return 'Enter account number';
      default: return 'Enter account details';
    }
  }

  isCheckoutEnabled(): boolean {
    
    const itemsToOrder = this.selectedItems.length > 0 ? this.selectedItems : this.cartItems;
    if (itemsToOrder.length === 0) {
      return false;
    }

    
    if (!this.selectedAddressId) {
      return false;
    }

    
    if (this.paymentOption === 'CASH_ON_DELIVERY') {
      return true;
    }

    
    if (this.paymentOption === 'PAY_NOW') {
      
      if (!this.selectedPaymentMethod) {
        return false;
      }

      
      if (!this.selectedAccountDetails || this.selectedAccountDetails.trim() === '') {
        return false;
      }

      return true;
    }

    return false;
  }
}