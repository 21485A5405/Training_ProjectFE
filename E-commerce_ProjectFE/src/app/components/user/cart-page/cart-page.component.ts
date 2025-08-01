
import Swal from "sweetalert2";
import { CartService } from "../../../services/cartservice";
import { ProfileService } from "../../../services/profileservice";
import { ChangeDetectorRef, Component, OnInit } from "@angular/core";
import { HttpHeaders } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OrderListComponent } from "../../details/order-list/order-list.component";
import { OrderService } from "../../../services/orderservice";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, FormsModule], // Add AddressModalComponent to the imports array
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
  paymentMethods: { type: string; value: string }[] = [];
  selectedPaymentMethod: { type: string; value: string } | null = null;



  constructor(
    private cartService: CartService,
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef,
    private orderService : OrderService,
    private http:HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedUserId = sessionStorage.getItem('userId');
    this.userId = storedUserId ? +storedUserId : 0;
    this.fetchCartItems(); 
    this.getAddresses();
    this.loadUserPaymentMethods();
  }

  goToMyOrders(): void {
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
  
    // Send the request to delete the cart item by its cartItemId
    this.cartService.deleteCartItem(cartItemId).subscribe({
      next: (response) => {
        console.log('Cart item deleted successfully', response);
        // Update the cart items array by removing the deleted item using cartItemId
        this.cartItems = this.cartItems.filter(item => item.cartItemId !== cartItemId);
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
      this.selectedItems = this.selectedItems.filter(i => i !== item); 
    }
  }

  increaseQuantity(item: any): void {
    const prevQuantity = item.productQuantity;
    item.productQuantity += 1; // Optimistic UI
    item.totalPrice = item.productQuantity * item.product.productPrice;

    this.cartService
      .increaseCartQuantity(this.userId, item.product.productId)
      .subscribe({
        error: (err) => {
          console.error('Error increasing quantity', err);
          // Revert on failure
          item.productQuantity = prevQuantity;
          item.totalPrice = prevQuantity * item.product.productPrice;
        },
      });
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
  
    if (!this.selectedPaymentMethod) {
      Swal.fire('Error', 'Please select a payment method.', 'error');
      return;
    }
  
    // Construct payload
    const orderData = this.selectedItems.map(item => ({
      userId: this.userId,
      addressId: this.selectedAddressId,
      productId: item.product.productId,
      quantity: item.productQuantity,
      paymentType: this.selectedPaymentMethod?.type
    }));
  
    if (orderData.length === 0) {
      Swal.fire('No items selected', 'Please select at least one item to place an order.', 'warning');
      return;
    }
  
    // Send request to backend
    this.orderService.placeOrder(orderData).subscribe({
      next: () => {
        Swal.fire('Success', 'Order placed successfully!', 'success');
        this.cartService.getCartItems(this.userId).subscribe((updatedCart) => {
          this.cartItems = updatedCart;
        });
      },
      error: (error) => {
        console.error('Order failed:', error);
        Swal.fire('Error', 'Failed to place order', 'error');
      }
    });
  }

  loadUserPaymentMethods(): void {
    this.profileService.getUserPaymentMethods(this.userId).subscribe({
      next: (methods) => {
        this.paymentMethods = methods.map(methodMap => {
          const [type, value] = Object.entries(methodMap)[0];
          return { type, value };
        });
      },
      error: (err) => console.error('Error fetching user payment methods', err),
    });
  }

  decreaseQuantity(item: any): void {
    if (item.productQuantity <= 1) return;

    const prevQuantity = item.productQuantity;
    item.productQuantity -= 1; // Optimistic UI
    item.totalPrice = item.productQuantity * item.product.productPrice;

    this.cartService
      .decreaseCartQuantity(this.userId, item.product.productId)
      .subscribe({
        error: (err) => {
          console.error('Error decreasing quantity', err);
          // Revert on failure
          item.productQuantity = prevQuantity;
          item.totalPrice = prevQuantity * item.product.productPrice;
        },
      });
  }
}