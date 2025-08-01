// app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';
import { Router } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,    
    RouterModule,   
    FormsModule,     
    RouterOutlet,
    HeaderComponent,MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './app.html', 
  styleUrls: ['./app.css'], 
})
export class App {
  protected readonly title = signal('E-commerce_ProjectFE');
  isDarkTheme: boolean = false;

  constructor(public router: Router) {}

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  shouldShowHeader(): boolean {
    const hiddenRoutes = ['/login', '/register'];
    return !hiddenRoutes.includes(this.router.url);
  }
}
