import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2'; // Import SweetAlert for user feedback
import { Subscription } from 'rxjs';
import { OrderService } from '../../../services/orderservice';

@Component({
  selector: 'app-order-page',
  templateUrl: './orders-page.component.html',
  styleUrls: ['./orders-page.component.css'],
  standalone: true,
  imports: [CommonModule],
  providers: [CurrencyPipe, DatePipe]
})
export class OrderPageComponent implements OnInit, OnDestroy {
  orders: any[] = []; // To store the order details
  loading: boolean = true; // Flag to manage loading state
  baseUrl: string = 'http://localhost:8080/orders'; // Your backend base URL
  private routerSub: Subscription | null = null;
  userId: number = 0; // Proper initialization of routerSub as null

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef ,// Inject ChangeDetectorRef
    private orderService : OrderService
  ) {}

  ngOnInit(): void {
    this.getOrderDetails();
    this.routerSub = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        console.log('NavigationEnd event caught');
        this.getOrderDetails(); 
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the router events when the component is destroyed
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }
  expandedOrderId: number | null = null;

  toggleOrderDetails(orderId: number): void {
    this.expandedOrderId = this.expandedOrderId === orderId ? null : orderId;
  }
  
  getProductNames(order: any): string {
    return order.products.map((p: any) => p.productName).join(', ');
  }

  // Helper method to calculate delivery date (7 days from order date)
  getDeliveryDate(orderDate: string): string {
    const order = new Date(orderDate);
    const deliveryDate = new Date(order);
    deliveryDate.setDate(order.getDate() + 7); // Add 7 days
    
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Helper method to get delivery status based on order date
  getDeliveryStatus(orderDate: string, orderStatus: string): string {
    if (orderStatus === 'DELIVERED') return 'Delivered';
    if (orderStatus === 'CANCELLED') return 'Cancelled';
    
    const order = new Date(orderDate);
    const deliveryDate = new Date(order);
    deliveryDate.setDate(order.getDate() + 7);
    const today = new Date();
    
    if (today >= deliveryDate) {
      return 'Ready for Delivery';
    } else {
      const daysLeft = Math.ceil((deliveryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return `Arriving in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`;
    }
  }

  // Method to get order details by user ID
  getOrderDetails() {
    this.loading = true; // Set loading to true while data is being fetched
    const userId = this.getUserIdFromSession(); // Extract userId from sessionStorage

    if (!userId) {
      Swal.fire('Error', 'User not logged in!', 'error');
      this.router.navigate(['/login']); // Redirect to login if userId is not found
      this.loading = false;
      return;
    }
    this.userId = parseInt(userId);
    // Prepare the authorization headers
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`,
    });
    console.log('123456');
    // Make the HTTP GET request to fetch orders
    this.http.get<any[]>(`${this.baseUrl}/get-by-user/${userId}`, { headers })
      .subscribe(
        (response) => {
          console.log(userId);
          console.log(response);
          this.orders = response; // Assign the response to the orders array
          this.loading = false; // Data is loaded, stop the loading state
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        (error) => {
          Swal.fire('Error', 'Failed to load orders!', 'error');
          console.error(error); // Log the error for debugging
          this.loading = false; // Stop loading even if there's an error
          this.cdr.detectChanges(); // Ensure change detection runs even if error occurs
        }
      );
  }

  // Method to extract userId from sessionStorage
  getUserIdFromSession(): string | null {
    return sessionStorage.getItem('userId');
  }

  cancelOrder(orderId: number) {
    // SweetAlert2 Confirmation
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to cancel order #${orderId}. Do you want to continue?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No, keep it',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.loading = true; // Show loading during cancellation request

        // Make DELETE request to cancel the order
        this.orderService.cancelOrder(orderId).subscribe(
          (response) => {
            this.loading = false; // Hide loading
            // Remove the canceled order from the list or refresh the orders
            this.orders = this.orders.filter(order => order.orderId !== orderId);
            Swal.fire(
              'Cancelled!',
              'Your order has been canceled.',
              'success'
            );
          },
          (error) => {
            this.loading = false; // Hide loading
            console.error('Error canceling order', error);
            Swal.fire(
              'Failed!',
              'Failed to cancel your order. Please try again later.',
              'error'
            );
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Action if canceled
        Swal.fire(
          'Cancelled',
          'Order Not Cancelled',
          'info'
        );
      }
    });
  }
}