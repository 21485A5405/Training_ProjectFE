import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileService } from '../../../services/profileservice';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  orders: any[] = [];
  orderStatuses: string[] = [];
  paymentStatuses: string[] = [];
  showOrderStatusDropdown: { [key: number]: boolean } = {}; 
  showPaymentStatusDropdown: { [key: number]: boolean } = {}; 
  selectedOrderStatus: { [key: number]: string } = {}; 
  selectedPaymentStatus: { [key: number]: string } = {}; 

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });

    this.http.get<any>('http://localhost:8080/orders/get-all', { headers }).subscribe({
      next: (response) => {
        this.orders = response.data;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        this.cdRef.detectChanges();
      }
    });

    this.http.get<string[]>('http://localhost:8080/orders/get-orderstatus', { headers }).subscribe({
      next: (response) => {
        this.orderStatuses = response;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching order statuses:', err);
        this.cdRef.detectChanges();
      }
    });

    this.profileService.getPaymentStatus().subscribe({
      next: (data: string[]) => {
        this.paymentStatuses = data;
        this.cdRef.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching payment statuses:', err);
        this.cdRef.detectChanges();
      }
    });
  }

  canEditOrderStatus(order: any): boolean {
    return order.orderStatus !== 'DELIVERED' && order.orderStatus !== 'CANCELLED';
  }
  
  canEditPaymentStatus(order: any): boolean {
    return order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED';
  }
  
  canSetDelivered(order: any): boolean {
    return order.paymentStatus === 'PAID';
  }

  updateOrderStatus(orderId: number, newStatus: string) {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });
    
    console.log('Order ID:', orderId);
    console.log('New Status:', newStatus);
      const order = this.orders.find(o => o.orderId === orderId);
      if (newStatus === 'DELIVERED' && !this.canSetDelivered(order)) {
        Swal.fire('Error', 'Cannot mark as DELIVERED unless payment is PAID.', 'warning');
        return;
      }
    const url = `http://localhost:8080/orders/update-orderstatus/${orderId}/${newStatus}`;
  
    this.http.put(url, {}, { headers }).subscribe({
      next: (response: any) => {
        Swal.fire('Updated', 'Order status updated successfully!', 'success');
        this.orders = this.orders.map(order =>
          order.orderId === orderId ? { ...order, orderStatus: newStatus } : order
        );
        this.cdRef.detectChanges();
        this.showOrderStatusDropdown[orderId] = false;
      },
      error: () => {
        Swal.fire('Error', 'Failed to update order status', 'error');
      }
    });
  }  

  updatePaymentStatus(orderId: number, paymentStatus: string) {
    console.log('Debug - updatePaymentStatus called with:');
    console.log('Order ID:', orderId);
    console.log('Payment Status:', paymentStatus);
  
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });
  
    const url = `http://localhost:8080/orders/update-paymentstatus/${orderId}/${paymentStatus}`;
  
    console.log('Constructed URL:', url);
  
    this.http.put(url, {}, { headers }).subscribe({
      next: (response: any) => {
        Swal.fire('Updated', 'Payment status updated successfully!', 'success');

        this.orders = this.orders.map(order =>
          order.orderId === orderId ? { ...order, paymentStatus } : order
        );
        this.showPaymentStatusDropdown[orderId] = false; 
      },
      error: (err) => {
        console.error('Error occurred while updating payment status:', err);
        Swal.fire('Error', 'Failed to update payment status', 'error');
      }
    });
  }  

  toggleOrderStatusDropdown(orderId: number) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (this.canEditOrderStatus(order)) {
      this.showOrderStatusDropdown[orderId] = !this.showOrderStatusDropdown[orderId];
      this.selectedOrderStatus[orderId] = order?.orderStatus || '';
    }
  }
  
  togglePaymentStatusDropdown(orderId: number) {
    const order = this.orders.find(o => o.orderId === orderId);
    if (this.canEditPaymentStatus(order)) {
      this.showPaymentStatusDropdown[orderId] = !this.showPaymentStatusDropdown[orderId];
      this.selectedPaymentStatus[orderId] = order?.paymentStatus || '';
    }
  }
  isOrderStatusButtonDisabled(orderStatus: string): boolean {
    return orderStatus === 'DELIVERED';
  }

  isPaymentStatusButtonDisabled(paymentStatus: string): boolean {
    return paymentStatus === 'PAID';
  }

  getOrderStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'status-pending';
      case 'PROCESSING':
        return 'status-processing';
      case 'SHIPPED':
        return 'status-shipped';
      case 'OUT_FOR_DELIVERY':
        return 'status-out-for-delivery';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'RETURNED':
        return 'status-returned';
      default:
        return 'status-pending';
    }
  }

  getPaymentStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'PENDING':
        return 'payment-pending';
      case 'PAID':
        return 'payment-paid';
      case 'FAILED':
        return 'payment-failed';
      case 'REFUNDED':
        return 'payment-refunded';
      default:
        return 'payment-pending';
    }
  }

  getDeliveryDate(orderDate: string, orderStatus?: string): string {
    const order = new Date(orderDate);
    
    // If order is returned, show today's date as return date
    if (orderStatus === 'RETURNED') {
      const returnDate = new Date(); // Current date as return date
      return returnDate.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
    
    // Otherwise show normal delivery date (order date + 7 days)
    const delivery = new Date(order);
    delivery.setDate(order.getDate() + 7);
    
    return delivery.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getDeliveryStatus(orderDate: string, orderStatus: string): string {
    // Convert order status to display format
    switch (orderStatus) {
      case 'DELIVERED':
        return 'Delivered';
      case 'CANCELLED':
        return 'Cancelled';
      case 'RETURNED':
        return 'Returned';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'SHIPPED':
        return 'Shipped';
      case 'PROCESSING':
        return 'Processing';
      case 'PENDING':
        return 'Pending';
      default:
        return orderStatus; // Return the actual status if not in the predefined list
    }
  }
}