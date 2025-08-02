import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../auth.service';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { RegisterSuccessDialogComponent } from '../../../shared/register-success-dialog/register-success-dialog.component';
import { ProfileService } from '../../../services/profileservice';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    RegisterSuccessDialogComponent
  ],
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.css']
})
export class RegisterPageComponent {
  userName = '';
  userEmail = '';
  userPassword = '';
  registerErrorMessage: string = '';
  registerSuccessMessage = '';
  isSubmitting = false;
  showDialog = false;
  emailExists: boolean = false;


  constructor(
    private router: Router,
    private authService: AuthService,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private profileService:ProfileService
  ) { }

  onRegister() {
    this.isSubmitting = true;
    const customerData = {
      userName: this.userName,
      userEmail: this.userEmail,
      userPassword: this.userPassword
    };

    this.authService.customerRegister(customerData).subscribe({
      next: (response) => {
        this.ngZone.run(() => {
          this.registerSuccessMessage = response?.message || 'Registration successful. Please login.';
          this.registerErrorMessage = '';
          this.isSubmitting = false;
          this.showDialog = true;
          this.cdRef.detectChanges();
        });
      },
      error: (error) => {
        this.ngZone.run(() => {
          this.registerErrorMessage = error?.error?.message || 'UserEmail Already Exists';
          this.registerSuccessMessage = '';
          this.isSubmitting = false;
          this.cdRef.detectChanges();
        });
        console.error('Registration error:', error);
      }
    });
  }

  checkIfEmailExists() {
    if (this.userEmail.trim()) {
      this.profileService.checkEmailExists(this.userEmail).subscribe({
        next: (exists) => {
          this.emailExists = exists;
          if (exists) {
            this.registerErrorMessage = 'Email is already registered.';
          } else {
            this.registerErrorMessage = '';
          }
        },
        error: (err) => {
          console.error('Email check failed:', err);
        }
      });
    }
  }

  closeSuccessModal() {
    this.showDialog = false;
    this.registerSuccessMessage = '';
    this.router.navigate(['/login']);
  }
}
