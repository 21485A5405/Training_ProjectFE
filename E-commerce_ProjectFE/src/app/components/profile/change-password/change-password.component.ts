import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { NgZone } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Import ProfileService
import { ProfileService } from '../../../services/profileservice';

@Component({
  selector: 'app-change-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private profileService: ProfileService // Inject ProfileService
  ) {}

  ngOnInit(): void {
    // Check if the user is logged in
    const userId = this.getLoggedInUserId();
    if (!userId) {
      Swal.fire({
        title: 'Login Required!',
        text: 'You must be logged in to change your password.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        // Redirect to login page after the alert
        this.router.navigate(['/login']);
      });
    }
  }

  // Method to get the logged-in userId
  getLoggedInUserId(): number | null {
    const userIdString = sessionStorage.getItem('userId');
    return userIdString ? Number(userIdString) : null;  // Ensure userId is a number
  }

  // Method to handle password change
  onSubmitChangePassword(): void {
    const userId = this.getLoggedInUserId();

    if (!userId) {
      Swal.fire({
        title: 'Error',
        text: 'User not logged in.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New password and confirm password do not match.';
      return;
    }

    // Call the ProfileService to get user details (including email)
    this.profileService.getProfile(userId).subscribe({
      next: (userDetails) => {
        const userEmail = userDetails.userEmail;  // Get user email from the response
        const token = sessionStorage.getItem('authToken') || '';

        // Construct the URL with email, currentPassword, and newPassword as path variables
        const url = `http://localhost:8080/users/change-password/${userEmail}/${this.currentPassword}/${this.newPassword}`;

        // Set headers with the token
        const headers = new HttpHeaders({
          'Authorization': `${token}`
        });

        // Make the request to change the password
        this.http.put(url, {}, { headers }).subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Password Changed Successfully!',
              text: 'Your password has been updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.router.navigate(['/user-profile']);  // Redirect to dashboard after success
          },
          error: (error) => {
            this.ngZone.run(() => {
              this.errorMessage = error?.error?.message || 'Failed to change password';
              console.log('Error message set:', this.errorMessage);
              this.cdRef.detectChanges();
            });
            console.error('Password change error:', error);
          }
        });
      },
      error: (error) => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch user details.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
        console.error('Failed to fetch user details:', error);
      }
    });
  }
}
