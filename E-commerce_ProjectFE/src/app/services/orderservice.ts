import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/orders'; // Base URL for orders

  private orderUrl = 'http://localhost:8080/orders/place-order';
  constructor(private http: HttpClient) {}

  // Fetch orders by user ID
  getOrdersByUserId(): Observable<any[]> {
    const userId = sessionStorage.getItem('userId'); // Get userId from sessionStorage
    const token = sessionStorage.getItem('authToken') || ''; // Get the token from sessionStorage
  
    const headers = new HttpHeaders({
      Authorization: token, // Add 'Bearer ' prefix if needed
    });
  
    return this.http.get<any[]>(`${this.apiUrl}/get-by-user/${userId}`, { headers });
  }

  placeOrder(orderData: any): Observable<any> {
    const token = sessionStorage.getItem('authToken') || ''; // Get the token from sessionStorage
    const headers = new HttpHeaders({
      Authorization: `${token}`, // Attach the token with "Bearer" prefix to the request headers
    });
  
    return this.http.post<any>(this.orderUrl, orderData, { headers });
  }
  // Update order status
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const token = sessionStorage.getItem('authToken') || ''; // Get the token from sessionStorage
    const headers = new HttpHeaders({
      Authorization: token, // Attach the token to the request headers
    });

    return this.http.put<any>(`${this.apiUrl}/update-orderstatus/${orderId}/${status}`, null, { headers });
  }
  cancelOrder(orderId :number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || ''; // Retrieve the token from sessionStorage
    const headers = new HttpHeaders({
      Authorization: `${token}`, // Pass the token in the header
    });

    return this.http.delete<any>(`${this.apiUrl}/cancel-order/${orderId}`, { headers });
  }
}
