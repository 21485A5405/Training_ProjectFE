import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private adminUrl = 'http://localhost:8080/admins'; // Replace with the correct API endpoint

  private ordersUrl = 'http://localhost:8080/orders/get-payments'
  private userUrl = 'http://localhost:8080/users'
  private baseUrl = 'http://localhost:8080/users/get-payment-methods'
  constructor(private http: HttpClient) {}

  private getAuthToken(): string | null {
    return sessionStorage.getItem('authToken'); // Retrieve token from sessionStorage
  }

  // Create headers with token
  private createHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    return new HttpHeaders({
      'Authorization': token ? `${token}` : '',  // Add token if available
      'Content-Type': 'application/json'  // Ensure content type is set
    });
  }

  // Fetch user addresses
  getUserAddresses(userId: number): Observable<any[]> {
    const headers = this.createHeaders();  // Create headers with token
    return this.http.get<any[]>(`${this.userUrl}/get-address/${userId}`, { headers });
  }

  getUserPaymentMethods(userId: number): Observable<{ [key: string]: string }[]> {
    const headers = this.createHeaders();
    return this.http.get<{ [key: string]: string }[]>(`${this.userUrl}/get-user-payment/${userId}`, { headers });
  }  

  // Get profile
  getProfile(userId: number): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get token from sessionStorage
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Set headers with the token
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return this.http.get<any>(`${this.adminUrl}/get-details/${userId}`, { headers });
  }
  checkEmailExists(email: string) {
    return this.http.get<boolean>(`http://localhost:8080/users/check-email?email=${email}`);
  }

  // Method to update the user profile by user ID
  updateAdminProfile(userId: number, user: any): Observable<any> {
    const token = sessionStorage.getItem('authToken'); // Get token from sessionStorage
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Set headers with the token
    const headers = new HttpHeaders({
      'Authorization': `${token}`
    });

    return this.http.put<any>(`${this.userUrl}/update-admin/${userId}`, user, { headers });
  }
  getPaymentEnums(): Observable<string[]> {
    return this.http.get<string[]>(this.baseUrl); 
  }
  getPaymentStatus() :Observable<string[]> {
    return this.http.get<string[]>(this.ordersUrl);
  }
  // Update address
  updateAddress(addressId: number, updatedAddress: any): Observable<any> {
    const headers = this.createHeaders();  // Create headers with token
    return this.http.put<any>(`${this.baseUrl}/edit-address/${addressId}`, updatedAddress, { headers });
  }

  addNewAddress(address: any, headers: HttpHeaders): Observable<any> {
    return this.http.post<any>(`${this.userUrl}/add-address`, address, { headers });
  }
  
  updateUser(userId: string, body: { userName: string; userEmail: string }) {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    });
    const url = `http://localhost:8080/users/update-user/${userId}`;
    return this.http.put(url, body, { headers });
  }
}
