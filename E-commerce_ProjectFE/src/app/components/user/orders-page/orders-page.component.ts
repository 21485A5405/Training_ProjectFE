import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, NavigationEnd } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
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
  orders: any[] = [];
  loading: boolean = true;
  baseUrl: string = 'http://localhost:8080/orders';
  private routerSub: Subscription | null = null;
  userId: number = 0;

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

 
  getDeliveryDate(orderDate: string): string {
    const order = new Date(orderDate);
    const deliveryDate = new Date(order);
    deliveryDate.setDate(order.getDate() + 7);
    
    return deliveryDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

 
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

 
  getOrderDetails() {
    this.loading = true;
    const userId = this.getUserIdFromSession();

    if (!userId) {
      Swal.fire('Error', 'User not logged in!', 'error');
      this.router.navigate(['/login']);
      this.loading = false;
      return;
    }
    this.userId = parseInt(userId);
   
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`,
    });
    console.log('123456');
   
    this.http.get<any[]>(`${this.baseUrl}/get-by-user/${userId}`, { headers })
      .subscribe(
        (response) => {
          console.log(userId);
          console.log(response);
          this.orders = response;
          this.loading = false;
          this.cdr.detectChanges();
        },
        (error) => {
          Swal.fire('Error', 'Failed to load orders!', 'error');
          console.error(error);
          this.loading = false;
          this.cdr.detectChanges();
        }
      );
  }

 
  getUserIdFromSession(): string | null {
    return sessionStorage.getItem('userId');
  }

  cancelOrder(orderId: number) {
   
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
        this.loading = true;

       
        this.orderService.cancelOrder(orderId).subscribe(
          (response) => {
            this.loading = false;
           
            this.orders = this.orders.filter(order => order.orderId !== orderId);
            Swal.fire(
              'Cancelled!',
              'Your order has been canceled.',
              'success'
            );
          },
          (error) => {
            this.loading = false;
            console.error('Error canceling order', error);
            Swal.fire(
              'Failed!',
              'Failed to cancel your order. Please try again later.',
              'error'
            );
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
       
        Swal.fire(
          'Cancelled',
          'Order Not Cancelled',
          'info'
        );
      }
    });
  }
}