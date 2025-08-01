import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditAddressDialogComponent } from '../../dialog/edit-address-dialog/edit-address-dialog.component';
import { UpdateUserDialogComponent } from '../../dialog/update-user-dialogcomponent/update-user-dialog.component';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-user-profile',
  imports : [CommonModule, FormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  userDetails: any;
  shippingAddresses: any[] = [];
  userPayments: any[] = [];
  newPaymentMethod: string = '';  // New payment method input
  newAccountDetails: string = '';
  userId: string = sessionStorage.getItem('userId') || ''; // Get userId from sessionStorage

  constructor(private http: HttpClient, private router: Router
    ,private cdr :ChangeDetectorRef, private dialog: MatDialog){}

  ngOnInit(): void {
    this.getUserDetails();
    this.getUserAddresses();
    this.getUserPayments();
  }

  sendUpdatedUserDetails(username: string, useremail: string) {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    });
  
    const updateUrl = `http://localhost:8080/update-user/${this.userId}`;
    const body = { username, useremail };
  
    this.http.put(updateUrl, body, { headers }).subscribe(
      (response) => {
        console.log('User updated successfully:', response);
        this.getUserDetails(); // Refresh user details
      },
      (error) => {
        console.error('Error updating user:', error);
      }
    );
  }
  
  addPaymentMethod() {
    if (!this.newPaymentMethod || !this.newAccountDetails) {
      Swal.fire('Error', 'Please fill in all fields for the new payment method.', 'error');
      return;
    }
  
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    });
  
    const paymentData = {
      paymentMethod: this.newPaymentMethod,
      accountDetails: this.newAccountDetails
    };
  
    // Construct the URL with userId as path variable
    const addPaymentUrl = `http://localhost:8080/users/add-payment/${this.userId}`;
    
    // Send the payment data in the request body
    this.http.post(addPaymentUrl, paymentData, { headers }).subscribe({
      next: (response) => {
        console.log('Payment method added successfully:', response); // Log successful response
        Swal.fire('Success', 'Payment method added successfully!', 'success');
        this.getUserPayments(); // Refresh the payment methods
        this.newPaymentMethod = ''; // Clear input fields
        this.newAccountDetails = '';
      },
      error: (err) => {
        console.error('Error adding payment method:', err); // Log any error details
        Swal.fire('Error', 'Failed to add payment method', 'error');
      }
    });
  }  
  // Fetch user details with token authorization
  getUserDetails() {
    const token = sessionStorage.getItem('authToken') || ''; // Get token from sessionStorage
    const headers = new HttpHeaders({
      Authorization: `${token}` // Add 'Bearer ' prefix to token
    });

    const userDetailsUrl = `http://localhost:8080/admins/get-details/${this.userId}`;
    this.http.get<any>(userDetailsUrl, { headers }).subscribe(
      (response) => {
        console.log(response);
        this.userDetails = response;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching user details:', error);
      }
    );
  }

  goToDashboard() {
    this.router.navigate(['/admin-dashboard']);
  }
  
  updateUserDetails() {
    const dialogRef = this.dialog.open(UpdateUserDialogComponent, {
      width: '400px',
      data: {
        userId: this.userId,
        username: this.userDetails.username,
        useremail: this.userDetails.useremail
      }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserDetails(); // Refresh updated data
      }
    });
  }
  
  getUserPayments() {
    const token = sessionStorage.getItem('authToken') || ''; // Get token from sessionStorage
    const headers = new HttpHeaders({
      Authorization: `${token}` // Add 'Bearer ' prefix to token
    });

    const paymentUrl = `http://localhost:8080/users/get-user-payments/${this.userId}`;
    this.http.get<any[]>(paymentUrl, { headers }).subscribe(
      (response) => {
        this.userPayments = response; // Store user payment methods
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching user payments:', error);
      }
    );
  }
  // Fetch shipping addresses of the user with token authorization
  getUserAddresses() {
    const token = sessionStorage.getItem('authToken') || ''; // Get token from sessionStorage
    const headers = new HttpHeaders({
      Authorization: `${token}` // Add 'Bearer ' prefix to token
    });

    const addressUrl = `http://localhost:8080/users/get-address/${this.userId}`;
    this.http.get<any[]>(addressUrl, { headers }).subscribe(
      (response) => {
        console.log('Shipping Addresses:', response); 
        this.shippingAddresses = response;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error fetching user addresses:', error);
      }
    );
  }
  
  editAddress(addressId: number) {
    const address = this.shippingAddresses.find(a => a.addressId === addressId);
    const dialogRef = this.dialog.open(EditAddressDialogComponent, {
      width: '400px',
      data: { addressId, currentAddress: address.fullAddress }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getUserAddresses(); // Refresh after update
      }
    });
  }
  
}
