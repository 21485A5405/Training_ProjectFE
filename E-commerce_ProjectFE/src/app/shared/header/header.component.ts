import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isSettingsDropdownVisible = false;
  searchQuery: string = '';
  cartCount: number = 0;

  constructor(private router: Router, private http: HttpClient){}

  get isLoggedIn(): boolean {
    const token = sessionStorage.getItem('authToken');
    return token !== null && token !== 'null' && token.trim() !== '';
  }

  toggleSettingsDropdown() {
    this.isSettingsDropdownVisible = !this.isSettingsDropdownVisible;
  }

  goHome(): void {
    this.router.navigate(['/home-page']);
  }

  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/home-page'], {
        queryParams: { q: this.searchQuery.trim() 
        }
      });
    }
  }

  goToCart(): void {
    const token = sessionStorage.getItem('authToken');

    if (!token || token === 'null') {
      Swal.fire({
        title: 'Please login!',
        text: 'You need to login to access your cart.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Login',
        cancelButtonText: 'Cancel'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    this.router.navigate(['/cart-page']);
  }

  goToProfile(): void {
    if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to view your profile.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    this.router.navigate(['/user-profile']);
  }
  goToOrders(): void {
    if (!this.isLoggedIn) {
      Swal.fire({
        title: 'Login Required!',
        text: 'Please login to view your Orders.',
        icon: 'warning',
        confirmButtonText: 'OK'
      }).then((result) => {
        if (result.isConfirmed) {
          this.router.navigate(['/login']);
        }
      });
      return;
    }
    this.router.navigate(['/orders-page']);
  }

  logout(): void {

    let token = sessionStorage.getItem('authToken');
    if (token?.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    this.http.delete(`http://localhost:8080/users/logout-user/${token}`, {
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
}