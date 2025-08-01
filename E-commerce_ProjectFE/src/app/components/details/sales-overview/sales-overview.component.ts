import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-sales-overview',
  imports :[CommonModule, FormsModule],
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

  constructor(private http: HttpClient, private cdr  : ChangeDetectorRef) {}

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
      this.cdr.detectChanges(); // force update
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
      .subscribe(data =>{
       this.topProducts = data
       this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/orders-count/SHIPPED', { headers })
      .subscribe((data) => {
        this.shippedOrders = data
      this.cdr.detectChanges();
      });

    this.http.get<number>('http://localhost:8080/sales/orders-count/CANCELLED', { headers })
      .subscribe((data) => {
        this.cancelledOrders = data
        this.cdr.detectChanges();
      });
  }

  getSortedTopProducts(): [string, number][] {
    return Object.entries(this.topProducts).sort((a, b) => b[1] - a[1]);
  }

  getSortedOrdersPerDay(): [string, number][] {
    return Object.entries(this.ordersPerDay).sort((a, b) => a[0].localeCompare(b[0]));
  }
}
