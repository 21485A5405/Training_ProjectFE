import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private baseUrl = 'http://localhost:8080/cart';

  constructor(private http: HttpClient) { }

  getCartItems(userId: number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
    });

    return this.http.get<any>(`${this.baseUrl}/get-all-by-user/${userId}`, {
      headers,
    });
  }

  deleteCartItem(cartItemId: number): Observable<any> {

    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
    });

    return this.http.delete(`${this.baseUrl}/delete-by-cartid/${cartItemId}`, { headers });
  }


  increaseCartQuantity(userId: number, productId: number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
    });

    return this.http.put<any>(
      `${this.baseUrl}/increase-cart/${userId}/${productId}`,
      {},
      { headers }
    );
  }

  decreaseCartQuantity(userId: number, productId: number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
    });

    return this.http.put<any>(
      `${this.baseUrl}/decrease-cart/${userId}/${productId}`,
      {},
      { headers }
    );
  }

  addToCart(userId: string, productId: number, quantity: number): Observable<any> {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
    });

    return this.http.post<any>(
      `${this.baseUrl}/add-to-cart/${userId}/${productId}`,
      {
        userId,
        productId,
        quantity
      },
      { headers }
    );
  }
}
