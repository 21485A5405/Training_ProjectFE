import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  private userUrl = 'http://localhost:8080/users';
  private adminUrl = 'http://localhost:8080/admins';

  constructor(private http: HttpClient) {}

  adminLogin(adminData: any): Observable<any> {
    return this.http.post(`${this.adminUrl}/login-admin`, adminData);
  }

  customerLogin(customerData: any): Observable<any> {    
    return this.http.post(`${this.userUrl}/login-user`, customerData);
  }

  customerRegister(customerData: any): Observable<any> {
    return this.http.post(`${this.userUrl}/register-user`, customerData);
  }
}
