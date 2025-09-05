import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test',
  imports: [CommonModule],
  template: `
    <div class="test-container">
      <h2>Test Component</h2>
      <div *ngIf="isAuthenticating">
        <p>Authenticating with Spotify...</p>
      </div>
      <div *ngIf="!isAuthenticating">
        <button (click)="initiateAuth()">Start Spotify Auth</button>
        <p *ngIf="authResult">{{ authResult }}</p>
      </div>
    </div>
  `,
  styles: [`
    .test-container {
      padding: 20px;
      text-align: center;
    }
  `]
})
export class TestPageComponent implements OnInit {
  isAuthenticating = false;
  authResult = '';

  constructor(
    private route: ActivatedRoute,
    private spotifyApi: SpotifyApiService,
    private router: Router,
    private httpClient: HttpClient
  ) {}

  ngOnInit() {
    // Check if we're coming back from Spotify OAuth
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      const error = params['error'];

      if (error) {
        console.error('Spotify auth error:', error);
        this.authResult = `Auth failed: ${error}`;
        return;
      }

      if (code) {
        this.isAuthenticating = true;
        this.spotifyApi.exchangeCodeForToken(code).subscribe({
          next: (response) => {
            // Example POST to backend with credentials
            this.httpClient.post(
              "https://192.168.1.111:7244/api/auth/login", // replace with your actual backend endpoint
              { token: response.access_token }, // example body, adjust as needed
              { withCredentials: true }
            ).subscribe({
              next: (res) => console.log('Backend response:', res),
              error: (err) => console.error('Backend error:', err)
            });
            // localStorage.setItem('access_token', response.access_token);
            // if (response.refresh_token) {
            //   localStorage.setItem('refresh_token', response.refresh_token);
            // }
            // this.authResult = 'Authentication successful!';
            // this.isAuthenticating = false;

            
            // Optionally redirect to home after a delay
            setTimeout(() => {
              this.router.navigate(['/home']);
            }, 2000);
          },
          error: (err) => {
            console.error('Token exchange failed:', err);
            this.authResult = 'Token exchange failed';
            this.isAuthenticating = false;
          }
        });
      }
    });
  }

  initiateAuth() {
    this.spotifyApi.initiateUserAuth();
  }
}