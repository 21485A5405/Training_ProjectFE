import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, MinLengthValidator } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { NgZone, ChangeDetectorRef } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
  ],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css'],
})
export class LoginPageComponent {
  isAdminLogin = false;
  showUserPassword = false;
  showAdminPassword = false;

  adminForm!: FormGroup;
  customerForm!: FormGroup;

  usererrorMessage = '';
  adminerrorMessage = '';

  adminSubmitted = false;
  userSubmitted = false;

  isAdminLoading = false;
  isUserLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private fb: FormBuilder
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    this.adminForm = this.fb.group({
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(5)]]
    });

    this.customerForm = this.fb.group({
      userEmail: ['', [Validators.required, Validators.email]],
      userPassword: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  toggleUserPasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showUserPassword = !this.showUserPassword;
  }

  toggleAdminPasswordVisibility(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showAdminPassword = !this.showAdminPassword;
  }

  toggleLoginMode() {
    this.isAdminLogin = !this.isAdminLogin;
    this.clearErrors();
    this.clearForms();
  }

  private clearErrors(): void {
    this.adminerrorMessage = '';
    this.usererrorMessage = '';
  }

  private clearForms(): void {
    this.adminForm.reset();
    this.customerForm.reset();
    this.adminSubmitted = false;
    this.userSubmitted = false;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Unable to connect to server. Please check your connection and try again.';
    }
    switch (error.status) {
      case 401: return error?.error?.message || 'Invalid credentials. Please check your email and password.';
      case 403: return error?.error?.message || 'Access forbidden. You do not have permission to access this resource.';
      case 404: return error?.error?.message || 'Account Not Found. Please register.';
      case 409: return error?.error?.message || 'Conflict occurred. Please try again.';
      case 422: return error?.error?.message || 'Invalid data provided. Please check your input.';
      case 500: return error?.error?.message || 'Internal server error. Please try again later.';
      case 400: return error?.error?.message || 'Bad request. Please check your input and try again.';
      case 502: return 'Bad gateway. Server is temporarily unavailable.';
      case 503: return 'Service temporarily unavailable. Please try again later.';
      case 504: return 'Gateway timeout. Please try again.';
      default:
        if (error?.error?.message) return error.error.message;
        if (error?.error && typeof error.error === 'string') return error.error;
        return 'An unexpected error occurred. Please try again.';
    }
  }
  
  getAdminEmailError(): string {
    const control = this.adminForm.get('adminEmail');
    if (control?.errors && (control.touched || this.adminSubmitted)) {
      if (control.errors['required']) {
        return 'Email is required';
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  getAdminPasswordError(): string {
    const control = this.adminForm.get('adminPassword');
    if (control?.errors && (control.touched || this.adminSubmitted)) {
      if (control.errors['required']) {
        return 'Password is required';
      }
      if (control.errors['minlength']) {
        return 'Password must be at least 5 characters long';
      }
    }
    return '';
  }

  getUserEmailError(): string {
    const control = this.customerForm.get('userEmail');
    if (control?.errors && (control.touched || this.userSubmitted)) {
      if (control.errors['required']) {
        return 'Email is required';
      }
      if (control.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }

  getUserPasswordError(): string {
    const control = this.customerForm.get('userPassword');
    if (control?.errors && (control.touched || this.userSubmitted)) {
      if (control.errors['required']) {
        return 'Password is required';
      }
      if (control.errors['minlength']) {
        return 'Password must be at least 5 characters long';
      }
    }
    return '';
  }

  
  hasAdminEmailError(): boolean {
    const control = this.adminForm.get('adminEmail');
    return !!(control?.errors && (control.touched || this.adminSubmitted));
  }

  hasAdminPasswordError(): boolean {
    const control = this.adminForm.get('adminPassword');
    return !!(control?.errors && (control.touched || this.adminSubmitted));
  }

  hasUserEmailError(): boolean {
    const control = this.customerForm.get('userEmail');
    return !!(control?.errors && (control.touched || this.userSubmitted));
  }

  hasUserPasswordError(): boolean {
    const control = this.customerForm.get('userPassword');
    return !!(control?.errors && (control.touched || this.userSubmitted));
  }

onAdminSubmit() {
  this.adminSubmitted = true;
  this.adminerrorMessage = '';
  console.log('Admin form submitted');
  
  this.adminForm.markAllAsTouched();

  if (this.adminForm.invalid) {
    console.log('Admin form is invalid');
    return;
  }

  this.isAdminLoading = true;
  console.log('Admin login starting...');

  const adminData = {
    loginEmail: this.adminForm.get('adminEmail')?.value,
    loginPassword: this.adminForm.get('adminPassword')?.value
  };

  this.authService.adminLogin(adminData).subscribe({
    next: (response) => {
      console.log('Admin login success');
      this.isAdminLoading = false;
      sessionStorage.setItem('authToken', response?.userToken);
      sessionStorage.setItem('userId', response?.userId);
      this.router.navigate(['/admin-dashboard']);
    },
    error: (error: HttpErrorResponse) => {
      console.log('Admin login error:', error);
      this.isAdminLoading = false;
      this.adminerrorMessage = this.getErrorMessage(error);
      console.log('Admin error message set to:', this.adminerrorMessage);
      
      this.cdRef.detectChanges();
      
      setTimeout(() => {
        console.log('Error message after timeout:', this.adminerrorMessage);
      }, 100);
    }
  });
}

onCustomerSubmit() {
  this.userSubmitted = true;
  this.usererrorMessage = '';
  console.log('Customer form submitted');
  
  this.customerForm.markAllAsTouched();

  if (this.customerForm.invalid) {
    console.log('Customer form is invalid');
    return;
  }

  this.isUserLoading = true;
  console.log('Customer login starting...');

  const userData = {
    loginEmail: this.customerForm.get('userEmail')?.value,
    loginPassword: this.customerForm.get('userPassword')?.value
  };

  this.authService.customerLogin(userData).subscribe({
    next: (response) => {
      console.log('Customer login success');
      this.isUserLoading = false;
      sessionStorage.setItem('authToken', response?.userToken);
      sessionStorage.setItem('userId', response?.userId);
      this.router.routeReuseStrategy.shouldReuseRoute = () => false;
      this.router.navigate(['/home-page']).then(() => window.location.reload());
    },
    error: (error: HttpErrorResponse) => {
      console.log('Customer login error:', error);
      this.isUserLoading = false;
      this.usererrorMessage = this.getErrorMessage(error);
      console.log('Customer error message set to:', this.usererrorMessage);
      
      
      this.cdRef.detectChanges();
      
      
      setTimeout(() => {
        console.log('Error message after timeout:', this.usererrorMessage);
      }, 100);
    }
  });
}

ngAfterViewChecked() {
  if (this.adminerrorMessage) {
    console.log('Admin error message in view:', this.adminerrorMessage);
  }
  if (this.usererrorMessage) {
    console.log('User error message in view:', this.usererrorMessage);
  }
}
  
  onAdminEmailChange(): void {
    if (this.adminerrorMessage) {
      this.adminerrorMessage = '';
    }
  }

  onAdminPasswordChange(): void {
    if (this.adminerrorMessage) {
      this.adminerrorMessage = '';
    }
  }

  onUserEmailChange(): void {
    if (this.usererrorMessage) {
      this.usererrorMessage = '';
    }
  }

  onUserPasswordChange(): void {
    if (this.usererrorMessage) {
      this.usererrorMessage = '';
    }
  }
}