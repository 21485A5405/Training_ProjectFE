import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-admin-dashboard',
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent {
  isDropdownVisible = false;
  constructor(private router: Router, private http: HttpClient) {}

  toggleDropdown(): void {
    this.isDropdownVisible = !this.isDropdownVisible;
  }
  isSettingsDropdownVisible = false;

  toggleSettingsDropdown() {
    this.isSettingsDropdownVisible = !this.isSettingsDropdownVisible;
  }
  
  showSettings = false;

  toggleSettingsMenu() {
    this.showSettings = !this.showSettings;
  }
  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInsideAvatar = target.closest('.profile-container');
    if (!clickedInsideAvatar) {
      this.isDropdownVisible = false;
    }
  }
  get isLoggedIn(): boolean {
    const token = sessionStorage.getItem('authToken');
    return token !== null && token !== 'null' && token.trim() !== '';
  }
  goToProfile(): void {
      if (!this.isLoggedIn) {
        Swal.fire({
          title: 'Login Required!',
          text: 'Please login to view your profile.',
          icon: 'warning',
          confirmButtonText: 'OK'
        });
        return;
      }
      this.router.navigate(['/user-profile']);
    }
    logout(): void {
      if (!this.isLoggedIn) {
        this.router.navigate(['/login']);
        return;
      }
  
      let token = sessionStorage.getItem('authToken');
      if (token?.startsWith('Bearer ')) {
        token = token.slice(7);
      }
  
      this.http.delete('http://localhost:8080/users/logout-user', {
        headers: {
          Authorization: token || ''
        }
      }).subscribe({
        next: () => console.log('Logged out from backend'),
        error: (err: any) => console.error('Backend logout failed', err)
      });
  
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
    goToSalesOverview() {if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to access',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
      this.router.navigate(['/sales-overview']);
    }
  
    goToOrderDetails() {if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to access ',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
      this.router.navigate(['/order-list']); // Make sure your route is correctly named
    }
  
    goToProductDetails() {if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to access ',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
      this.router.navigate(['/product-list']);
    }
  
    goToUserDetails() {if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to access ',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
      this.router.navigate(['/user-list']);
    }
    goToChangePassword() {if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to access .',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then(() => {
        this.router.navigate(['/login']);
      });
      return;
    }
      this.router.navigate(['/change-password']);
    }
}

