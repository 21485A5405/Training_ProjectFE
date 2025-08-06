import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';  // CommonModule for common directives (ngIf, ngFor)
import { FormsModule } from '@angular/forms';  // FormsModule for two-way data binding
import { Router, RouterModule } from '@angular/router'; // RouterModule for routing
import { AuthService } from '../../../auth.service';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,  
    FormsModule,  
    RouterModule,  
  ],
  templateUrl: './login-page.component.html',  
  styleUrls: ['./login-page.component.css'],  
})
export class LoginPageComponent {
  isAdminLogin: boolean = false;
  showUserPassword: boolean = false;

  toggleUserPasswordVisibility(): void {
    this.showUserPassword = !this.showUserPassword;
  }
  adminEmail = '';
  adminPassword = '';
  userEmail = '';
  userPassword = '';
  usererrorMessage: string = '';
  adminerrorMessage: string = '';
  showAdminPassword: boolean = false;

  toggleAdminPasswordVisibility(): void {
    this.showAdminPassword = !this.showAdminPassword;
  }
  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef
  ) {}

  toggleLoginMode() {
    this.isAdminLogin = !this.isAdminLogin;
    this.adminerrorMessage = '';
    this.usererrorMessage = '';
    this.adminEmail = '';
    this.adminPassword = '';
    this.userEmail = '';
    this.userPassword = '';
  }

  onAdminSubmit() {
    const adminData = {
      loginEmail: this.adminEmail,
      loginPassword: this.adminPassword
    };
    this.authService.adminLogin(adminData).subscribe({
      next: (response) => {
        sessionStorage.setItem('authToken', response?.userToken);
        sessionStorage.setItem('userId', response?.userId);
        this.ngZone.run(() => {
          this.adminerrorMessage = '';
          this.router.navigate(['/admin-dashboard']);
          this.cdRef.detectChanges();
        });
      },
      error: (error) => {
        const message = error?.error?.message || 'Invalid Admin credentials';
        this.ngZone.run(() => {
          this.adminerrorMessage = message;
          Swal.fire({
            icon: 'error',
            title: 'Admin Login Failed',
            text: message,
          });
          this.cdRef.detectChanges();
        });
      }
    });
  }
 
  onCustomerSubmit() {
    const userData = {
      loginEmail: this.userEmail,
      loginPassword: this.userPassword
    };
    this.authService.customerLogin(userData).subscribe({
      next: (response) => {
        sessionStorage.setItem('authToken', response?.userToken);
        sessionStorage.setItem('userId', response?.userId);
        this.usererrorMessage = '';
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.navigate(['/product-details']).then(() => {
          window.location.reload();
        });
      },
      error: (error) => {
        const message = error?.error?.message || 'Invalid customer credentials';
        this.ngZone.run(() => {
          this.usererrorMessage = message;
          Swal.fire({
            icon: 'error',
            title: 'Customer Login Failed',
            text: message,
          });
          this.cdRef.detectChanges();
        });
      }
    });
  }
}