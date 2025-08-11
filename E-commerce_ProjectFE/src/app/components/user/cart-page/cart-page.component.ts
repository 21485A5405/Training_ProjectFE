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
  // paymentMethods: { type: string; value: string }[] = [];
  // selectedPaymentMethod: { type: string; value: string } | null = null;
  
  totalItemsCount: number = 0;
  totalPrice: number = 0;
  selectedItemsCount: number = 0;
  selectedItemsTotal: number = 0;
  shippingCost: number = 5.00;

  // Payment option properties
  paymentOption: 'PAY_NOW' | 'CASH_ON_DELIVERY' = 'CASH_ON_DELIVERY';
  
  showAddAddressForm: boolean = false;
  showAddPaymentForm: boolean = false;
  newAddress: string = '';
  newPaymentMethod: string = '';
  newAccountDetails: string = '';
  paymentEnums: string[] = [];

  constructor(
    private cartService: CartService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private orderService : OrderService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('userId');
    this.userId = storedUserId ? +storedUserId : 0;
    this.fetchCartItems(); 
    this.getAddresses();
    // this.loadUserPaymentMethods();
    // this.getPaymentEnums();
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
      this.showAddAddressForm = false; 
      return;
    }

    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });

    const addressData = { fullAddress: this.newAddress };

    this.http.post(`http://localhost:8080/users/add-address`, addressData, {
      headers,
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        Swal.fire('Success', 'Address added successfully!', 'success');
        this.newAddress = '';
        this.showAddAddressForm = false;
        this.getAddresses(); 
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error adding address:', err);
        Swal.fire('Error', 'Failed to add address.', 'error');
        this.showAddAddressForm = false; 
      }
    });
  }
  
  addPaymentMethod(): void {
    if (!this.newPaymentMethod || !this.newAccountDetails) {
      Swal.fire('Error', 'Please fill in all fields for the new payment method.', 'error');
      this.showAddPaymentForm = false; 
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
        this.newPaymentMethod = '';
        this.newAccountDetails = '';
        this.showAddPaymentForm = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error adding payment method:', err);
        Swal.fire('Error', 'Failed to add payment method', 'error');
        this.showAddPaymentForm = false; 
      }
    });
  }

  calculateTotals(): void {
    this.totalItemsCount = this.cartItems.reduce((total, item) => total + item.productQuantity, 0);
    this.totalPrice = this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
    
    this.selectedItemsCount = this.selectedItems.reduce((total, item) => total + item.productQuantity, 0);
    this.selectedItemsTotal = this.selectedItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  getFinalTotal(): number {
    return this.selectedItemsTotal + this.shippingCost;
  }

  getAllItemsTotal(): number {
    return this.totalPrice + this.shippingCost;
  }

  getDeliveryDate(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); 
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  navigateToOrders(): void {
    this.router.navigate(['/orders-page']);
  }

  getAddresses(): void {
    this.profileService.getUserAddresses(this.userId).subscribe(
      (res) => {
        this.userAddresses = res;
      },
      (err) => {
        console.error('Failed to load addresses', err);
      }
    );
  }

  deleteCartItem(cartItemId: number): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json',
    });
  
    this.cartService.deleteCartItem(cartItemId).subscribe({
      next: (response) => {
        console.log('Cart item deleted successfully', response);
        this.cartItems = this.cartItems.filter(item => item.cartItemId !== cartItemId);
        this.selectedItems = this.selectedItems.filter(item => item.cartItemId !== cartItemId);
        this.calculateTotals();
        Swal.fire('Success', 'Cart item deleted successfully', 'success');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to delete cart item:', err);
        Swal.fire('Error', 'Failed to delete cart item', 'error');
      },
    });
  }

  fetchCartItems(): void {
    this.cartService.getCartItems(this.userId).subscribe({
      next: (response) => {
        console.log(response);
        this.cartItems = response.data;
        this.isLoading = false;
        this.calculateTotals();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load cart items:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleSelection(item: any, event: any): void {
    if (event.target.checked) {
      this.selectedItems.push(item); 
    } else {
      this.selectedItems = this.selectedItems.filter(i => i.cartItemId !== item.cartItemId); 
    }
    this.calculateTotals();
  }

  increaseQuantity(item: any): void {
    const prevQuantity = item.productQuantity;
    item.productQuantity += 1; 
    item.totalPrice = item.productQuantity * item.product.productPrice;
    this.calculateTotals();

    this.cartService
      .increaseCartQuantity(this.userId, item.product.productId)
      .subscribe({
        next: () => {
          this.calculateTotals();
        },
        error: (err) => {
          console.error('Error increasing quantity', err);
          item.productQuantity = prevQuantity;
          item.totalPrice = prevQuantity * item.product.productPrice;
          this.calculateTotals();
        },
      });
  }

  decreaseQuantity(item: any): void {
    if (item.productQuantity <= 1) return;

    const prevQuantity = item.productQuantity;
    item.productQuantity -= 1; 
    item.totalPrice = item.productQuantity * item.product.productPrice;
    this.calculateTotals();

    this.cartService
      .decreaseCartQuantity(this.userId, item.product.productId)
      .subscribe({
        next: () => {
          this.calculateTotals();
        },
        error: (err) => {
          console.error('Error decreasing quantity', err);
          item.productQuantity = prevQuantity;
          item.totalPrice = prevQuantity * item.product.productPrice;
          this.calculateTotals();
        },
      });
  }

  // Payment option methods
  selectPaymentOption(option: 'PAY_NOW' | 'CASH_ON_DELIVERY'): void {
    this.paymentOption = option;
  }

  getPaymentStatus(): 'PAID' | 'PENDING' {
    return this.paymentOption === 'PAY_NOW' ? 'PAID' : 'PENDING';
  }

  placeOrder(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });
    
    if (!this.selectedAddressId) {
      Swal.fire('Error', 'Please select a shipping address.', 'error');
      return;
    }
  
    // Remove payment method validation since we're using payment options
    
    const orderData = this.selectedItems.map(item => ({
      userId: this.userId,
      addressId: this.selectedAddressId,
      productId: item.product.productId,
      quantity: item.productQuantity,
      paymentOption: this.paymentOption,
      paymentStatus: this.getPaymentStatus()
    }));
  
    if (orderData.length === 0) {
      Swal.fire('No items selected', 'Please select at least one item to place an order.', 'warning');
      return;
    }
  
    const deliveryDate = this.getDeliveryDate();
    
    // Show different confirmation based on payment option
    if (this.paymentOption === 'PAY_NOW') {
      // For Pay Now, show payment processing
      Swal.fire({
        title: 'Processing Payment...',
        text: 'Please wait while we process your payment.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      
      // Simulate payment processing delay
      setTimeout(() => {
        this.processOrder(orderData, deliveryDate);
      }, 2000);
    } else {
      // For Cash on Delivery, process immediately
      this.processOrder(orderData, deliveryDate);
    }
  }

  private processOrder(orderData: any[], deliveryDate: string): void {
    this.orderService.placeOrder(orderData).subscribe({
      next: () => {
        const paymentMessage = this.paymentOption === 'PAY_NOW' 
          ? 'Payment completed successfully!' 
          : 'Order placed! Payment will be collected on delivery.';
        
        Swal.fire({
          icon: 'success',
          title: 'Order Placed Successfully!',
          html: `
            <div style="text-align: left; margin: 20px 0;">
              <p><strong>Payment Method:</strong> ${this.paymentOption === 'PAY_NOW' ? 'Paid Online' : 'Cash on Delivery'}</p>
              <p><strong>Payment Status:</strong> ${this.getPaymentStatus()}</p>
              <p><strong>Order Total:</strong> ${this.formatCurrency(this.getFinalTotal())}</p>
              <p><strong>Items Ordered:</strong> ${this.selectedItemsCount} items</p>
              <p><strong>Expected Delivery:</strong> <span style="color: #28a745; font-weight: bold;">${deliveryDate}</span></p>
              <p style="margin-top: 15px; color: #666; font-size: 14px;">
                📦 ${paymentMessage}
              </p>
            </div>
          `,
          confirmButtonText: 'Continue Shopping',
          allowOutsideClick: false
        }).then(() => {
          this.router.navigate(['/welcome']);
        });
      },
      error: (err) => {
        console.error('Error placing order:', err);
        Swal.fire('Error', 'Failed to place order. Please try again.', 'error');
      }
    });
  }

  loadUserPaymentMethods(): void {
    this.profileService.getUserPaymentMethods(this.userId).subscribe({
      next: (methods) => {
        // this.paymentMethods = methods.map(methodMap => {
        //   const [type, value] = Object.entries(methodMap)[0];
        //   return { type, value };
        // });
      },
      error: (err) => console.error('Error fetching user payment methods', err),
    });
  }

  goToHome():void {
    this.router.navigate(['/home-page'])
  }
  
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  updateShippingCost(event: any): void {
    this.shippingCost = +event.target.value;
    this.calculateTotals(); 
  }

  onShippingChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.shippingCost = +target.value;
    this.calculateTotals();
  }
}