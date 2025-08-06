import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('authToken');

    if (token) {
      return true;
    }

    // Redirect to 404 page if not logged in
    this.router.navigate(['/404']);
    return false;
  }
}
