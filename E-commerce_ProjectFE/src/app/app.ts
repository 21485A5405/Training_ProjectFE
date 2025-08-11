import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HeaderComponent } from './shared/header/header.component';
import { Router, NavigationEnd } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AnalyticsService } from './services/analytics.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class App implements OnInit {
  protected readonly title = signal('E-commerce_ProjectFE');

  constructor(
    public router: Router,
    private analyticsService: AnalyticsService
  ) {
    // Track page views on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.trackPageView(event.url);
    });
  }

  ngOnInit(): void {
    this.initializeVisitorTracking();
  }

  private initializeVisitorTracking(): void {
    // Check if this is a new visitor today
    if (this.analyticsService.isNewVisitorToday()) {
      // Track the visitor
      this.analyticsService.trackVisitor('app-init').subscribe({
        next: () => {
          console.log('Visitor tracked successfully');
          this.analyticsService.markVisitorTracked();
        },
        error: (err) => {
          console.log('Visitor tracking failed:', err);
          // Still mark as tracked to avoid repeated failed attempts
          this.analyticsService.markVisitorTracked();
        }
      });
    }
  }

  private trackPageView(url: string): void {
    // Extract meaningful page name from URL
    let pageName = url.split('?')[0]; // Remove query parameters
    if (pageName === '/') pageName = '/home';
    
    this.analyticsService.trackPageView(pageName).subscribe({
      next: () => console.log(`Page view tracked: ${pageName}`),
      error: (err) => console.log('Page view tracking failed:', err)
    });
  }
}
