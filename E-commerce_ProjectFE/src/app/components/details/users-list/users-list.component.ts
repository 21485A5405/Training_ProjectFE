import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
@Component({
  selector: 'app-users-list',
  standalone:true,
  imports :[CommonModule],
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  users: any[] = [];

  constructor(private http: HttpClient, private cdr :ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchAllUsers();
  }

  fetchAllUsers(): void {
    const token = sessionStorage.getItem('authToken');
    const authHeader = token?.startsWith('Bearer ') ? token : '' + token;

    this.http.get<any>('http://localhost:8080/admins/get-all-users', {
      headers: {
        Authorization: authHeader || ''
      }
    }).subscribe({
      next: (response) => {
        console.log('Response from backend:', response); 
        this.users = response.data || [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to fetch users:', err);
      }
    });
  }
}