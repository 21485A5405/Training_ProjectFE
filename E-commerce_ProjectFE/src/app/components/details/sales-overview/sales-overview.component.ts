import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-sales-overview',
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-overview.component.html',
  styleUrls: ['./sales-overview.component.css']
})
export class SalesOverviewComponent implements OnInit {
  totalRevenue: number = 0;
  totalOrders: number = 0;
  ordersPerDay: { [key: string]: number } = {};
  topProducts: { [key: string]: number } = {};
  shippedOrders: number = 0;
  cancelledOrders: number = 0;
  activeTab: string = 'orders';
  
  // New properties for enhanced functionality
  dailyRevenue: { [key: string]: number } = {};
  selectedPeriod: string = 'month';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cdr.detectChanges();
    this.fetchSalesData();
  }

  fetchSalesData(): void {
    const token = sessionStorage.getItem('authToken') || '';
    const headers = new HttpHeaders({
      Authorization: `${token}`,
      'Content-Type': 'application/json'
    });

    this.http.get<number>('http://localhost:8080/sales/total-revenue', { headers })
      .subscribe(data => {
        console.log('Revenue:', data);
        this.totalRevenue = data;
        this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/total-orders', { headers })
      .subscribe(data => {
        console.log('Orders:', data);
        this.totalOrders = data;
        this.cdr.detectChanges();
      });

    this.http.get<{ [key: string]: number }>('http://localhost:8080/sales/orders-per-day', { headers })
      .subscribe(data => {
        this.ordersPerDay = data;
        this.cdr.detectChanges();
      });

    this.http.get<{ [key: string]: number }>('http://localhost:8080/sales/top-products', { headers })
      .subscribe(data => {
        this.topProducts = data;
        this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/orders-count/SHIPPED', { headers })
      .subscribe((data) => {
        this.shippedOrders = data;
        this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/orders-count/CANCELLED', { headers })
      .subscribe((data) => {
        this.cancelledOrders = data;
        this.cdr.detectChanges();
      });

    this.http.get<{ [key: string]: number }>('http://localhost:8080/sales/daily-revenue', { headers })
      .subscribe(data => {
        this.dailyRevenue = data;
        this.cdr.detectChanges();
      });
  }

  // Existing methods
  getSortedTopProducts(): [string, number][] {
    return Object.entries(this.topProducts).sort((a, b) => b[1] - a[1]);
  }

  getSortedOrdersPerDay(): [string, number][] {
    return Object.entries(this.ordersPerDay).sort((a, b) => a[0].localeCompare(b[0]));
  }

  // New methods for enhanced functionality
  
  /**
   * Get the day with peak orders
   * @returns string - Date of peak order day
   */
  getPeakOrderDay(): string {
    const sortedOrders = this.getSortedOrdersPerDay();
    if (sortedOrders.length === 0) return 'N/A';
    
    const peakDay = sortedOrders.reduce((max, current) => 
      current[1] > max[1] ? current : max
    );
    
    // TODO: Format date properly or return formatted string
    return peakDay[0];
  }

  /**
   * Calculate average orders per day
   * @returns number - Average orders per day
   */
  getAverageOrdersPerDay(): number {
    const orders = Object.values(this.ordersPerDay);
    if (orders.length === 0) return 0;
    
    const total = orders.reduce((sum, count) => sum + count, 0);
    return total / orders.length;
  }

  /**
   * Get maximum orders in a single day (for chart scaling)
   * @returns number - Maximum orders per day
   */
  getMaxOrdersPerDay(): number {
    const orders = Object.values(this.ordersPerDay);
    return orders.length > 0 ? Math.max(...orders) : 0;
  }

  /**
   * Get sorted daily revenue data
   * @returns [string, number][] - Array of [date, revenue] tuples
   */
  getSortedDailyRevenue(): [string, number][] {
    // TODO: Implement when daily revenue API is available
    // For now, return empty array or mock data
    return Object.entries(this.dailyRevenue).sort((a, b) => a[0].localeCompare(b[0]));
  }

  /**
   * Get maximum daily revenue (for chart scaling)
   * @returns number - Maximum revenue in a single day
   */
  getMaxDailyRevenue(): number {
    const revenues = Object.values(this.dailyRevenue);
    return revenues.length > 0 ? Math.max(...revenues) : 0;
  }

  /**
   * Calculate average daily revenue
   * @returns number - Average revenue per day
   */
  getAverageDailyRevenue(): number {
    const revenues = Object.values(this.dailyRevenue);
    if (revenues.length === 0) return 0;
    
    const total = revenues.reduce((sum, amount) => sum + amount, 0);
    return total / revenues.length;
  }

  /**
   * Handle period selection change
   * @param period - Selected time period
   */
  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    // TODO: Implement period-based data fetching
    // this.fetchSalesData();
  }

  /**
   * Handle tab change between orders and revenue
   * @param tab - Selected tab ('orders' or 'revenue')
   */
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  /**
   * Export sales report
   * TODO: Implement export functionality
   */
  exportReport(): void {
    console.log('Export report functionality to be implemented');
  }

  /**
   * Navigate to detailed analytics
   * TODO: Implement navigation
   */
  viewDetailedAnalytics(): void {
    console.log('Navigate to detailed analytics');
  }

  /**
   * Set up alerts
   * TODO: Implement alert setup
   */
  setupAlerts(): void {
    console.log('Setup alerts functionality to be implemented');
  }

  /**
   * Open settings
   * TODO: Implement settings functionality
   */
  openSettings(): void {
    console.log('Open settings functionality to be implemented');
  }

  /**
   * Get growth percentage for metrics
   * TODO: Implement based on historical data
   * @param current - Current value
   * @param previous - Previous period value
   * @returns number - Growth percentage
   */
  getGrowthPercentage(current: number, previous: number): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  }

  /**
   * Check if growth is positive
   * @param current - Current value
   * @param previous - Previous period value  
   * @returns boolean - True if growth is positive
   */
  isGrowthPositive(current: number, previous: number): boolean {
    return current > previous;
  }

  /**
   * Format currency display
   * @param amount - Amount to format
   * @returns string - Formatted currency string
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format number with commas
   * @param num - Number to format
   * @returns string - Formatted number string
   */
  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
  }
}