import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-address-dialog',
  standalone: true,
  templateUrl: './edit-address-dialog.component.html',
  styleUrls: ['./edit-address-dialog.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule
  ]
})
export class EditAddressDialogComponent {
  newAddress: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private dialogRef: MatDialogRef<EditAddressDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { addressId: string; currentAddress: string },
    private snackBar: MatSnackBar
  ) {
    this.newAddress = data.currentAddress;
  }

  submit() {
    this.isLoading = true;
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({ Authorization: `${token}` });

    const url = `http://localhost:8080/users/edit-address/${this.data.addressId}/${encodeURIComponent(this.newAddress)}`;
    this.http.put(url, {}, { headers, responseType: 'text' }).subscribe(
      () => {
        this.isLoading = false;
        Swal.fire({
          title: 'Success!',
          text: 'Address updated successfully!',
          icon: 'success',
          confirmButtonText: 'OK'
        }).then(() => {
          this.dialogRef.close(true); // Close the dialog after showing the alert
        });
      },
      (error) => {
        this.isLoading = false;
        console.error('Update failed:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Update failed. Please try again.',
          icon: 'error',
          confirmButtonText: 'OK'
        }).then(() => {
          this.dialogRef.close(false); // Close the dialog on error
        });
      }
    );
  }
}
