import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface SpotifyUser {
  display_name: string;
  email: string;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  id: string;
  country: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'https://localhost:7244/api';
  private userSubject = new BehaviorSubject<SpotifyUser | null>(null);
  
  public user$ = this.userSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
    
    // Listen for storage changes (when user logs in from another tab or after login)
    window.addEventListener('storage', (event) => {
      if (event.key === 'User' || event.key === 'jwt_token') {
        this.loadUserFromStorage();
      }
    });
    
    // Also check periodically for localStorage changes in the same tab
    this.setupPeriodicCheck();
  }

  private setupPeriodicCheck() {
    // Check every 1 second for auth state changes
    setInterval(() => {
      const currentUser = this.userSubject.value;
      const storageUser = this.getUserFromStorage();
      
      // If the storage state differs from our current state, update it
      if ((currentUser && !storageUser) || (!currentUser && storageUser) || 
          (currentUser && storageUser && currentUser.email !== storageUser.email)) {
        this.loadUserFromStorage();
      }
    }, 1000);
  }

  private getUserFromStorage(): SpotifyUser | null {
    try {
      const userData = localStorage.getItem('User');
      const token = localStorage.getItem('jwt_token');
      if (userData && token) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('Error parsing user data from storage:', error);
    }
    return null;
  }

  private loadUserFromStorage() {
    const user = this.getUserFromStorage();
    if (user && user !== this.userSubject.value) {
      console.log('Auth service: User data updated from storage', user);
      this.userSubject.next(user);
    } else if (!user && this.userSubject.value) {
      console.log('Auth service: User logged out');
      this.userSubject.next(null);
    }
  }

  getCurrentUser(): SpotifyUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('jwt_token');
    const user = localStorage.getItem('User');
    const isAuth = !!(token && user);
    console.log('Auth service: isAuthenticated check:', isAuth, { hasToken: !!token, hasUser: !!user });
    return isAuth;
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('jwt_token');
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    return headers;
  }

  logout(): Observable<any> {
    const headers = this.getAuthHeaders();
    
    // Call backend logout endpoint
    return this.http.post(`${this.apiUrl}/auth/logout`, {}, { headers })
      .pipe(
        map(() => this.clearUserData()),
        catchError((error) => {
          console.warn('Backend logout failed, clearing local data anyway:', error);
          this.clearUserData();
          throw error;
        })
      );
  }

  private clearUserData() {
    // Clear all authentication data
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('IsAdmin');
    localStorage.removeItem('User');
    
    // Update user subject
    this.userSubject.next(null);
    
    // Redirect to landing page
    this.router.navigate(['/']);
  }

  // Method for logout without backend call (fallback)
  logoutLocal() {
    this.clearUserData();
  }

  // Method to manually refresh auth state (call after login)
  refreshAuthState() {
    console.log('Auth service: Manually refreshing auth state');
    this.loadUserFromStorage();
  }

  // Method to check if localStorage has user data
  hasUserData(): boolean {
    return !!(localStorage.getItem('jwt_token') && localStorage.getItem('User'));
  }
}