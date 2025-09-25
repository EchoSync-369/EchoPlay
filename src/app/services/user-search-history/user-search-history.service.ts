import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface IUserSearchHistory {
  id: number;
  query: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserSearchHistoryService {
  private apiUrl = `${environment.apiUrl}/UserSearchHistory`;
  private jwt = localStorage.getItem('jwt_token');

  constructor(private http: HttpClient) {}

  getSearchHistory(): Observable<IUserSearchHistory[]> {
    return this.http.get<IUserSearchHistory[]>(this.apiUrl, {
      headers: this.jwt ? { Authorization: `Bearer ${this.jwt}` } : {},
      withCredentials: true
    });
  }

  addSearch(query: string): Observable<IUserSearchHistory> {
    const jwt = localStorage.getItem('jwt_token');
    return this.http.post<IUserSearchHistory>(
      this.apiUrl,
      { query },
      {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        withCredentials: true
      }
    );
  }

  deleteSearch(searchId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${searchId}`, {
      headers: this.jwt ? { Authorization: `Bearer ${this.jwt}` } : {},
      withCredentials: true
    });
  }
}