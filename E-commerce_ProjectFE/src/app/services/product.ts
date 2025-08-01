import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

export interface Product {
  productId: number;
  productName: string;
  productCategory: string;
  productDescription: string;
  productImageURL: string;
  productPrice: number;
  productQuantity: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/products/getall';

  private baseUrl = 'http://localhost:8080/products';
  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<Product[]> {
    return this.http.get<{ message: string; data: Product[] }>(this.apiUrl).pipe(
      tap(response => console.log('API response:', response)),
      map(response => response.data)
    );
  }
  addToCart(payload: any, headers: any): Observable<any> {
    return this.http.post('http://localhost:8080/cart/add-to-cart', payload, headers);
    
  }
  updateProduct(product: any) {
    let token = sessionStorage.getItem('authToken') || '';

    // If it starts with "Bearer ", remove it
    if (token.startsWith('Bearer ')) {
      token = token.substring(7); // remove "Bearer "
    }

    const headers = new HttpHeaders({
      'Authorization': token, // assuming your backend uses "token" as the header key
      'Content-Type': 'application/json'
    });

    return this.http.put(`${this.baseUrl}/update-product/${product.productId}`, product, { headers });
  }
  updateQuantity(productId: number, quantity: number) {
    let token = sessionStorage.getItem('authToken') || '';
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
  
    const headers = new HttpHeaders({
      'Authorization': token, // assuming your backend uses "token" as the header key
      'Content-Type': 'application/json'
    });

  
    return this.http.put(`http://localhost:8080/products/update-quantity/${productId}/${quantity}`, {}, { headers });
  }
  
  addProduct(product: any) {
    let token = sessionStorage.getItem('authToken') || '';
    
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
  
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });
  
    return this.http.post('http://localhost:8080/products/add-product', product, { headers });
  }
  
  deleteProduct(productId: number) {
    let token = sessionStorage.getItem('authToken') || '';
    if (token.startsWith('Bearer ')) {
      token = token.substring(7);
    }
  
    const headers = new HttpHeaders({
      'Authorization': token,
    });
  
    return this.http.delete(`http://localhost:8080/products/delete-by-id/${productId}`, { headers });
  }
  
}
