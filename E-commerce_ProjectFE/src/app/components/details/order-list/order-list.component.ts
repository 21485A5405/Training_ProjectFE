import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProfileService } from '../../../services/profileservice'; // For payment methods
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
  showOrderStatusDropdown: { [key: number]: boolean } = {}; // Tracks which order has order status dropdown visible
  showPaymentStatusDropdown: { [key: number]: boolean } = {}; // Tracks which order has payment status dropdown visible
  selectedOrderStatus: { [key: number]: string } = {}; // To store temporary selected order status
  selectedPaymentStatus: { [key: number]: string } = {}; // To store temporary selected payment status

  constructor(
    private http: HttpClient,
    private cdRef: ChangeDetectorRef,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });

    // Fetch orders
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

    // Fetch order statuses
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

    // Fetch payment statuses from profile service
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
    // Allow editing only if status is not PAID or REFUNDED
    return order.paymentStatus !== 'PAID' && order.paymentStatus !== 'REFUNDED';
  }
  
  canSetDelivered(order: any): boolean {
    // Only allow DELIVERED if payment is PAID
    return order.paymentStatus === 'PAID';
  }

  
  // Method to update order status
  updateOrderStatus(orderId: number, newStatus: string) {
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });
    
    // Log for debugging
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
        // Update the local list of orders after successful update
        this.orders = this.orders.map(order =>
          order.orderId === orderId ? { ...order, orderStatus: newStatus } : order
        );
        this.cdRef.detectChanges();
        this.showOrderStatusDropdown[orderId] = false; // Close dropdown after update
      },
      error: () => {
        Swal.fire('Error', 'Failed to update order status', 'error');
      }
    });
  }  

  // Method to update payment status
  updatePaymentStatus(orderId: number, paymentStatus: string) {
    // Debugging logs
    console.log('Debug - updatePaymentStatus called with:');
    console.log('Order ID:', orderId);
    console.log('Payment Status:', paymentStatus);
  
    const token = sessionStorage.getItem('authToken');
    const headers = new HttpHeaders({ Authorization: `${token}` });
  
    // Construct the URL with both orderId and paymentStatus as path variables
    const url = `http://localhost:8080/orders/update-paymentstatus/${orderId}/${paymentStatus}`;
  
    // Log the URL for debugging
    console.log('Constructed URL:', url);
  
    // Send the PUT request to update the payment status
    this.http.put(url, {}, { headers }).subscribe({
      next: (response: any) => {
        Swal.fire('Updated', 'Payment status updated successfully!', 'success');
        // Update the local list of orders after successful update
        this.orders = this.orders.map(order =>
          order.orderId === orderId ? { ...order, paymentStatus } : order
        );
        this.showPaymentStatusDropdown[orderId] = false; // Close dropdown after update
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
  

  // Disable Update Order Status button when the status is 'Shipped'
  isOrderStatusButtonDisabled(orderStatus: string): boolean {
    return orderStatus === 'DELIVERED';
  }

  // Disable Apply Payment Status button when the status is 'PAID'
  isPaymentStatusButtonDisabled(paymentStatus: string): boolean {
    return paymentStatus === 'PAID';
  }

  // Add these methods to your component class

getOrderStatusClass(status: string): string {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'status-pending';
    case 'PROCESSING':
      return 'status-processing';
    case 'SHIPPED':
      return 'status-shipped';
    case 'DELIVERED':
      return 'status-delivered';
    case 'CANCELLED':
      return 'status-cancelled';
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
}
