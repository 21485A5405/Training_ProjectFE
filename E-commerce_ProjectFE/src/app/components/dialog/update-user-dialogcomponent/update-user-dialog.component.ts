import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ProfileService } from '../../../services/profileservice';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-update-user-dialog',
  standalone: true,imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './update-user-dialog.component.html',
  styleUrls: ['./update-user-dialog.component.css'],
})
export class UpdateUserDialogComponent {
  userName: string;
  userEmail: string;

  constructor(
    public dialogRef: MatDialogRef<UpdateUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: string; userName: string; userEmail: string },
    private profileService: ProfileService
  ) {
    this.userName = data.userName;
    this.userEmail = data.userEmail;
  }

  onSave(): void {
    const requestBody = {
      userName: this.userName,
      userEmail: this.userEmail
    };

    this.profileService.updateUser(this.data.userId, requestBody).subscribe(
      () => {
        Swal.fire('Success', 'User details updated successfully!', 'success');
        this.dialogRef.close(requestBody); 
      },
      (error) => {
        console.error('Update failed:', error);
        Swal.fire('Error', 'Failed to update user details.', 'error');
      }
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

