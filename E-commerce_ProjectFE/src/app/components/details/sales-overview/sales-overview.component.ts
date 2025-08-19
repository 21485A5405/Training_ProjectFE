import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { AnalyticsService, AnalyticsData } from '../../../services/analytics.service';

@Component({
  selector: 'app-sales-overview',
  standalone: true,
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
  deliveredOrders: number = 0;
  returnedOrder: number = 0;
  dailyRevenue: { [key: string]: number } = {};
  selectedPeriod: string = 'month';

  previousPeriodRevenue: number = 0;
  previousPeriodOrders: number = 0;
  totalVisitors: number = 0;
  previousPeriodVisitors: number = 0;
  visitorsPerDay: { [key: string]: number } = {};
  analyticsData: AnalyticsData | null = null;

  Math = Math;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private analyticsService: AnalyticsService
  ) { }

  ngOnInit(): void {
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

    this.http.get<number>('http://localhost:8080/sales/orders-count/DELIVERED', { headers })
      .subscribe((data) => {
        this.deliveredOrders = data;
        this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/orders-count/CANCELLED', { headers })
      .subscribe((data) => {
        this.cancelledOrders = data;
        this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/orders-count/RETURNED', { headers })
      .subscribe({
        next: (data) => {
          this.returnedOrder = data;
          this.cdr.detectChanges();
          console.log('Returned orders count:', data);
        },
        error: (error) => {
          console.error('Error fetching returned orders:', error);
          this.returnedOrder = 0;
          this.cdr.detectChanges();
        }
      });

    this.http.get<{ [key: string]: number }>('http://localhost:8080/sales/daily-revenue', { headers })
      .subscribe(data => {
        this.dailyRevenue = data;
        this.cdr.detectChanges();
      });

    
    this.fetchVisitorAnalytics();
  }

  fetchVisitorAnalytics(): void {
    
    this.analyticsService.getTotalVisitors().subscribe({
      next: (data) => {
        this.totalVisitors = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch total visitors:', err);
        
        this.totalVisitors = 0;
      }
    });

    
    this.analyticsService.getVisitorsByPeriod(this.selectedPeriod).subscribe({
      next: (data) => {
        this.previousPeriodVisitors = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch previous period visitors:', err);
        this.previousPeriodVisitors = 0;
      }
    });

    
    this.analyticsService.getVisitorsPerDay().subscribe({
      next: (data) => {
        this.visitorsPerDay = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch visitors per day:', err);
        this.visitorsPerDay = {};
      }
    });

    
    this.analyticsService.getAnalyticsData().subscribe({
      next: (data) => {
        this.analyticsData = data;
        
        this.totalVisitors = data.totalVisitors;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch analytics data:', err);
        this.analyticsData = null;
      }
    });

  }

  getSortedTopProducts(): [string, number][] {
    return Object.entries(this.topProducts).sort((a, b) => b[1] - a[1]);
  }

  getSortedOrdersPerDay(): [string, number][] {
    return Object.entries(this.ordersPerDay).sort((a, b) => a[0].localeCompare(b[0]));
  }

  getPeakOrderDay(): string {
    const sortedOrders = this.getSortedOrdersPerDay();
    if (sortedOrders.length === 0) return 'N/A';

    const peakDay = sortedOrders.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return peakDay[0];
  }

  getAverageOrdersPerDay(): number {
    const orders = Object.values(this.ordersPerDay);
    if (orders.length === 0) return 0;

    const total = orders.reduce((sum, count) => sum + count, 0);
    return total / orders.length;
  }

  getMaxOrdersPerDay(): number {
    const orders = Object.values(this.ordersPerDay);
    return orders.length > 0 ? Math.max(...orders) : 0;
  }

  getSortedDailyRevenue(): [string, number][] {
    
    return Object.entries(this.dailyRevenue).sort((a, b) => a[0].localeCompare(b[0]));
  }

  getMaxDailyRevenue(): number {
    const revenues = Object.values(this.dailyRevenue);
    return revenues.length > 0 ? Math.max(...revenues) : 0;
  }

  getAverageDailyRevenue(): number {
    const revenues = Object.values(this.dailyRevenue);
    if (revenues.length === 0) return 0;

    const total = revenues.reduce((sum, amount) => sum + amount, 0);
    return total / revenues.length;
  }

  onPeriodChange(event: any): void {
    this.selectedPeriod = event.target.value;
    this.fetchSalesData();
    this.fetchVisitorAnalytics(); 
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  exportReport(): void {
    console.log('Export report functionality to be implemented');
  }

  viewDetailedAnalytics(): void {
    console.log('Navigate to detailed analytics');
  }

  setupAlerts(): void {
    console.log('Setup alerts functionality to be implemented');
  }

  openSettings(): void {
    console.log('Open settings functionality to be implemented');
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-IN').format(num);
  }
  getRevenueGrowth(): number {
    if (this.previousPeriodRevenue === 0) return 0;
    return ((this.totalRevenue - this.previousPeriodRevenue) / this.previousPeriodRevenue) * 100;
  }

  getOrdersGrowth(): number {
    if (this.previousPeriodOrders === 0) return 0;
    return ((this.totalOrders - this.previousPeriodOrders) / this.previousPeriodOrders) * 100;
  }

  getAOVGrowth(): number {
    const currentAOV = this.getAverageOrderValue();
    const previousAOV = this.previousPeriodOrders > 0 ? this.previousPeriodRevenue / this.previousPeriodOrders : 0;
    if (previousAOV === 0) return 0;
    return ((currentAOV - previousAOV) / previousAOV) * 100;
  }

  getConversionGrowth(): number {
    const currentRate = this.getConversionRate();
    const previousRate = this.previousPeriodVisitors > 0 ? (this.previousPeriodOrders / this.previousPeriodVisitors) * 100 : 0;
    if (previousRate === 0) return 0;
    return ((currentRate - previousRate) / previousRate) * 100;
  }

  getAverageOrderValue(): number {
    if (this.totalOrders === 0) return 0;
    return this.totalRevenue / this.totalOrders;
  }

  getConversionRate(): number {
    if (this.totalVisitors === 0) return 0;
    return (this.totalOrders / this.totalVisitors) * 100;
  }

  getShippedPercentage(): number {
    if (this.totalOrders === 0) return 0;
    return (this.shippedOrders / this.totalOrders) * 100;
  }

  getDeliveredPercentage(): number {
    if (this.totalOrders === 0) return 0;
    return (this.deliveredOrders / this.totalOrders) * 100;
  }

  getCancelledPercentage(): number {
    if (this.totalOrders === 0) return 0;
    return (this.cancelledOrders / this.totalOrders) * 100;
  }

  getReturnedPercentage(): number {
    if (this.totalOrders === 0) return 0;
    return (this.returnedOrder / this.totalOrders) * 100;
  }

  getTotalActiveDays(): number {
    return Object.keys(this.ordersPerDay).length;
  }

  getDailyGrowthRate(): number {
    const revenues = this.getSortedDailyRevenue();
    if (revenues.length < 2) return 0;

    const firstDay = revenues[0][1];
    const lastDay = revenues[revenues.length - 1][1];

    if (firstDay === 0) return 0;
    return ((lastDay - firstDay) / firstDay) * 100;
  }

  getTotalProductsSold(): number {
    return Object.keys(this.topProducts).length;
  }

  getBestSellingProduct(): string {
    const sorted = this.getSortedTopProducts();
    return sorted.length > 0 ? sorted[0][0] : 'N/A';
  }

  getTopProductSales(): number {
    const sorted = this.getSortedTopProducts();
    return sorted.length > 0 ? sorted[0][1] : 0;
  }

  getProductRevenue(productId: string): number {
    const unitsSold = this.topProducts[productId] || 0;
    return unitsSold * 1299;
  }

  
  getTotalVisitorDays(): number {
    return Object.keys(this.visitorsPerDay).length;
  }

  getMaxVisitorsPerDay(): number {
    const visitors = Object.values(this.visitorsPerDay);
    return visitors.length > 0 ? Math.max(...visitors) : 0;
  }

  getAverageVisitorsPerDay(): number {
    const visitors = Object.values(this.visitorsPerDay);
    if (visitors.length === 0) return 0;

    const total = visitors.reduce((sum, count) => sum + count, 0);
    return total / visitors.length;
  }

  getSortedVisitorsPerDay(): [string, number][] {
    return Object.entries(this.visitorsPerDay).sort((a, b) => a[0].localeCompare(b[0]));
  }

  getPeakVisitorDay(): string {
    const sortedVisitors = this.getSortedVisitorsPerDay();
    if (sortedVisitors.length === 0) return 'N/A';

    const peakDay = sortedVisitors.reduce((max, current) =>
      current[1] > max[1] ? current : max
    );

    return peakDay[0];
  }

  
  getVisitorGrowth(): number {
    if (this.previousPeriodVisitors === 0) return 0;
    return ((this.totalVisitors - this.previousPeriodVisitors) / this.previousPeriodVisitors) * 100;
  }

  
  viewAllProducts(): void {
    console.log('Navigate to all products view');
  }

  manageInventory(): void {
    console.log('Navigate to inventory management');
  }

  refreshAnalytics(): void {
    this.fetchSalesData();
    this.fetchVisitorAnalytics();
  }
}