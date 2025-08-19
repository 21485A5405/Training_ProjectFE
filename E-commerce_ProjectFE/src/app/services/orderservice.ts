import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = 'http://localhost:8080/orders';

  private orderUrl = 'http://localhost:8080/orders/place-order';
  constructor(private http: HttpClient) {}

  
  getOrdersByUserId(): Observable<any[]> {
    const userId = sessionStorage.getItem('userId'); 
    const token = sessionStorage.getItem('authToken') || ''; 
  
    const headers = new HttpHeaders({
      Authorization: token, 
    });
  
    return this.http.get<any[]>(`${this.apiUrl}/get-by-user/${userId}`, { headers });
  }

  placeOrder(orderData: any): Observable<any> {
    const token = sessionStorage.getItem('authToken') || ''; 
    const headers = new HttpHeaders({
      Authorization: `${token}`, 
    });
    return this.http.post<any>(`${this.apiUrl}/place-order`, orderData, { headers });
  }
  
  updateOrderStatus(orderId: number, status: string): Observable<any> {
    const token = sessionStorage.getItem('authToken') || ''; 
    const headers = new HttpHeaders({
      Authorization: token, 
    });

    return this.http.put<any>(`${this.apiUrl}/update-orderstatus/${orderId}/${status}`, null, { headers });
  }
  
  cancelOrder(orderId :number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || ''; 
    const headers = new HttpHeaders({
      Authorization: `${token}`, 
    });

    return this.http.post<any>(`${this.apiUrl}/cancel-order/${orderId}`,null, { headers });
  }

  
  returnProduct(orderId :number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`, 
    });

    return this.http.post<any>(`${this.apiUrl}/return-product/${orderId}`,null, { headers });
  }
}
