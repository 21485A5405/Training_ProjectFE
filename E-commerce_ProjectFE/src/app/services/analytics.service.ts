import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface VisitorData {
  sessionId: string;
  timestamp: Date;
  page: string;
  userAgent: string;
  referrer?: string;
}

export interface AnalyticsData {
  totalVisitors: number;
  dailyVisitors: number;
  weeklyVisitors: number;
  monthlyVisitors: number;
  uniqueVisitorsToday: number;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private baseUrl = 'http://localhost:8080/sales';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('authToken') || '';
    return new HttpHeaders({
      'Authorization': token,
      'Content-Type': 'application/json'
    });
  }

  
  trackVisitor(page: string = 'home-page'): Observable<any> {
    const sessionId = this.getOrCreateSessionId();
    
    const visitorData: VisitorData = {
      sessionId: sessionId,
      timestamp: new Date(),
      page: page,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    };

    return this.http.post(`${this.baseUrl}/track-visitor`, visitorData, { 
      headers: this.getAuthHeaders() 
    });
  }

  
  trackPageView(page: string): Observable<any> {
    const sessionId = this.getSessionId();
    
    if (sessionId) {
      return this.http.post(`${this.baseUrl}/track-page-view`, {
        sessionId: sessionId,
        page: page,
        timestamp: new Date()
      }, { headers: this.getAuthHeaders() });
    }
    
    return new Observable(observer => observer.complete());
  }

  
  getTotalVisitors(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/total-visitors`, {
      headers: this.getAuthHeaders()
    });
  }

  
  getVisitorsByPeriod(period: string = 'month'): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/visitors-by-period/${period}`, {
      headers: this.getAuthHeaders()
    });
  }

  
  getAnalyticsData(): Observable<AnalyticsData> {
    return this.http.get<AnalyticsData>(`${this.baseUrl}/analytics-summary`, {
      headers: this.getAuthHeaders()
    });
  }

  
  getVisitorsPerDay(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.baseUrl}/visitors-per-day`, {
      headers: this.getAuthHeaders()
    });
  }

  
  private getOrCreateSessionId(): string {
    let sessionId = this.getSessionId();
    
    if (!sessionId) {
      sessionId = this.generateSessionId();
      sessionStorage.setItem('visitor_session_id', sessionId);
      sessionStorage.setItem('visitor_first_visit', new Date().toISOString());
    }
    
    return sessionId;
  }

  private getSessionId(): string | null {
    return sessionStorage.getItem('visitor_session_id');
  }

  private generateSessionId(): string {
    return 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  
  isNewVisitorToday(): boolean {
    const lastTracked = sessionStorage.getItem('visitor_last_tracked');
    const today = new Date().toDateString();
    
    return !lastTracked || lastTracked !== today;
  }

  
  markVisitorTracked(): void {
    const today = new Date().toDateString();
    sessionStorage.setItem('visitor_last_tracked', today);
  }
} 