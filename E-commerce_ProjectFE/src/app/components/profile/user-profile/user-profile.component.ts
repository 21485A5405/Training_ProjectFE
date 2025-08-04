import { Component, OnInit, ChangeDetectorRef, HostListener } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';

import { EditAddressDialogComponent } from '../../dialog/edit-address-dialog/edit-address-dialog.component';
import { UpdateUserDialogComponent } from '../../dialog/update-user-dialogcomponent/update-user-dialog.component';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userDetails: any;
  shippingAddresses: any[] = [];
  userPayments: any[] = [];
  newAddress = '';
  newPaymentMethod = '';
  newAccountDetails = '';
  isSettingsDropdownVisible = false;

  userId = sessionStorage.getItem('userId') || '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUserDetails();
    this.getUserAddresses();
    this.getUserPayments();
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const settingsDropdown = target.closest('.settings-dropdown');
    
    if (!settingsDropdown && this.isSettingsDropdownVisible) {
      this.isSettingsDropdownVisible = false;
    }
  }

  // Toggle settings dropdown
  toggleSettingsDropdown(): void {
    this.isSettingsDropdownVisible = !this.isSettingsDropdownVisible;
  }

  // Navigate to change password and close dropdown
  navigateToChangePassword(): void {
    this.isSettingsDropdownVisible = false;
    this.router.navigate(['/change-password']);
  }

  // Dashboard navigation
  goToDashboard(): void {
    this.router.navigate(['/admin-dashboard']);
  }

  // Delete account functionality
  deleteAccount(): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This action will permanently delete your account and cannot be undone!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete my account',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        const token = sessionStorage.getItem('authToken') || '';
        const headers = new HttpHeaders({ Authorization: token });
  
        this.http.delete(`http://localhost:8080/users/delete-user-by-id/${this.userId}`, { headers }).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Deleted!',
              text: 'Your account has been deleted.',
              confirmButtonColor: '#007bff'
            }).then(() => {
              sessionStorage.clear();
              this.router.navigate(['/register']);
            });
          },
          error: (err) => {
            console.error('Error deleting account:', err);
            Swal.fire({
              icon: 'error',
              title: 'Deletion Failed',
              text: 'Something went wrong while deleting your account.',
              confirmButtonColor: '#007bff'
            });
          }
        });
      }
    });
  }  

  // Get user details
  getUserDetails(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: token });

    this.http.get<any>(`http://localhost:8080/admins/get-details/${this.userId}`, { headers }).subscribe({
      next: (res) => {
        this.userDetails = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching user details:', err)
    });
  }

  // Get user addresses
  getUserAddresses(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: token });

    this.http.get<any[]>(`http://localhost:8080/users/get-address/${this.userId}`, { headers }).subscribe({
      next: (res) => {
        this.shippingAddresses = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching addresses:', err)
    });
  }

  // Add new address
  addNewAddress(): void {
    if (!this.newAddress.trim()) {
      Swal.fire('Error', 'Please enter a valid address.', 'error');
      return;
    }

    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });

    const addressData = { fullAddress: this.newAddress };

    this.http.post(`http://localhost:8080/users/add-address`, addressData, {
      headers,
      responseType: 'text'
    }).subscribe({
      next: (res) => {
        if (res === 'Address Added Successfully') {
          Swal.fire('Success', res, 'success');
          this.newAddress = '';
          this.getUserAddresses();
        } else {
          Swal.fire('Warning', 'Unexpected response from server.', 'warning');
        }
      },
      error: () => Swal.fire('Error', 'Failed to add address.', 'error')
    });
  }

  // Edit address
  editAddress(addressId: number): void {
    const address = this.shippingAddresses.find(a => a.addressId === addressId);
    const dialogRef = this.dialog.open(EditAddressDialogComponent, {
      width: '400px',
      data: { addressId, currentAddress: address.fullAddress }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getUserAddresses();
    });
  }

  // Get user payments
  getUserPayments(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: token });

    this.http.get<any[]>(`http://localhost:8080/users/get-user-payments/${this.userId}`, { headers }).subscribe({
      next: (res) => {
        this.userPayments = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error fetching payments:', err)
    });
  }

  // Add payment method
  addPaymentMethod(): void {
    if (!this.newPaymentMethod || !this.newAccountDetails) {
      Swal.fire('Error', 'Please fill in all fields for the new payment method.', 'error');
      return;
    }

    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: token,
      'Content-Type': 'application/json'
    });

    const paymentData = {
      paymentMethod: this.newPaymentMethod,
      accountDetails: this.newAccountDetails
    };

    this.http.post(`http://localhost:8080/users/add-payment/${this.userId}`, paymentData, { headers }).subscribe({
      next: () => {
        Swal.fire('Success', 'Payment method added successfully!', 'success');
        this.getUserPayments();
        this.newPaymentMethod = '';
        this.newAccountDetails = '';
      },
      error: () => Swal.fire('Error', 'Failed to add payment method', 'error')
    });
  }

  // Update user details
  updateUserDetails(): void {
    const dialogRef = this.dialog.open(UpdateUserDialogComponent, {
      width: '400px',
      data: {
        userId: this.userId,
        username: this.userDetails.userName,
        useremail: this.userDetails.userEmail
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.getUserDetails();
    });
  }
}