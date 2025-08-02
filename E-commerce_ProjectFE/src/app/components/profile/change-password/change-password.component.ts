import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProfileService } from '../../../services/profileservice';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';

  isCurrentPasswordInvalid = false;
  isConfirmPasswordInvalid = false;

  constructor(
    private router: Router,
    private http: HttpClient,
    private ngZone: NgZone,
    private cdRef: ChangeDetectorRef,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    const userId = this.getLoggedInUserId();
    if (!userId) {
      Swal.fire({
        title: 'Login Required!',
        text: 'You must be logged in to change your password.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/login']);
      });
    }
  }

  getLoggedInUserId(): number | null {
    const userIdString = sessionStorage.getItem('userId');
    return userIdString ? Number(userIdString) : null;
  }

  onSubmitChangePassword(): void {
    const userId = this.getLoggedInUserId();

    // Reset flags
    this.isCurrentPasswordInvalid = false;
    this.isConfirmPasswordInvalid = false;

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
      this.isConfirmPasswordInvalid = true;
      Swal.fire({
        title: 'Mismatch!',
        text: 'New password and confirm password do not match.',
        icon: 'error',
        confirmButtonText: 'Try Again'
      });
      return;
    }

    this.profileService.getProfile(userId).subscribe({
      next: (userDetails) => {
        const userEmail = userDetails.userEmail;
        const token = sessionStorage.getItem('authToken') || '';

        const url = `http://localhost:8080/users/change-password/${userEmail}/${this.currentPassword}/${this.newPassword}`;
        const headers = new HttpHeaders({ 'Authorization': `${token}` });

        this.http.put(url, {}, { headers }).subscribe({
          next: () => {
            Swal.fire({
              title: 'Password Changed Successfully!',
              text: 'Your password has been updated.',
              icon: 'success',
              confirmButtonText: 'OK'
            });
            this.router.navigate(['/user-profile']);
          },
          error: (error) => {
            this.ngZone.run(() => {
              const errorMessage = error?.error || '';
              if (error.status === 404 && errorMessage === 'Current Password Is Wrong') {
                this.isCurrentPasswordInvalid = true;
                Swal.fire({
                  title: 'Incorrect Password',
                  text: 'The current password you entered is incorrect.',
                  icon: 'error',
                  confirmButtonText: 'Try Again'
                });
              } else {
                Swal.fire({
                  title: 'Error',
                  text: errorMessage || 'Failed to change password',
                  icon: 'error',
                  confirmButtonText: 'OK'
                });
              }
              this.cdRef.detectChanges();
            });
          }
        });
      },
      error: () => {
        Swal.fire({
          title: 'Error',
          text: 'Failed to fetch user details.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }
}
