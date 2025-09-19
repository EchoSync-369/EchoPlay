import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { Album } from "../../models/album";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SpotifyApiService {
  constructor(private http: HttpClient, private router: Router) { }

  get headers(): HttpHeaders {
    const token = localStorage.getItem("access_token") || "";
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAccessToken(p0: (success: boolean) => void): void {
    const body = new HttpParams()
      .set("grant_type", "client_credentials")
      .set("client_id", environment.clientId)
      .set("client_secret", environment.clientSecret);

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });

    this.http
      .post<any>("https://accounts.spotify.com/api/token", body, { headers })
      .subscribe({
        next: (response) => {
          localStorage.setItem("access_token", response.access_token);
          p0(true);
        },
        error: (err) => {
          console.error("Failed to get access token:", err);
          p0(false);
        },
      });
  }

  getNewReleases(p0: (albums: Album[]) => void) {
    return this.http
      .get<any>("https://api.spotify.com/v1/browse/new-releases", {
        headers: this.headers,
      })
      .subscribe({
        next: (response) => {
          console.log("Response received:", response);
          // Call the callback with the albums array if available
          if (response && response.albums && response.albums.items) {
            p0(response.albums.items as Album[]);
          } else {
            p0([]);
          }
        },
        error: (err) => {
          console.error("Oopsies tehe:", err);
          if (err.status === 401) {
            localStorage.removeItem("access_token");
            this.router.navigate(['/landing']);
          }
          p0([]);
        },
      });
  }

  search(query: string, p0: (results: any) => void) {
    const params = new HttpParams()
      .set("q", query)
      .set("type", "album,artist,track,playlist");

    return this.http
      .get<any>("https://api.spotify.com/v1/search", {
        headers: this.headers,
        params: params,
      })
      .subscribe({
        next: (response) => {
          console.log("Search response received:", response);
          p0(response);
        },
        error: (err) => {
          console.error("Search error:", err);
          if (err.status === 401) {
            localStorage.removeItem("access_token");
            this.router.navigate(['/landing']);
          }
          p0(null);
        },
      });
  }

  // private readonly REDIRECT_URI = environment.redirecturi;
  // private readonly REDIRECT_URI = "https://echosync-369.github.io/EchoPlay/test";
  private readonly REDIRECT_URI = "http://127.0.0.1:4200/landing";
  private readonly SCOPES = 'streaming user-read-email user-read-private user-read-playback-state user-modify-playback-state';

  initiateUserAuth(): void {
    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${environment.clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(this.REDIRECT_URI)}&` +
      `scope=${encodeURIComponent(this.SCOPES)}`;

    window.location.href = authUrl;
  }

  exchangeCodeForToken(code: string): Observable<any> {
    const body = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('code', code)
      .set('redirect_uri', this.REDIRECT_URI)
      .set('client_id', environment.clientId)
      .set('client_secret', environment.clientSecret);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<any>('https://accounts.spotify.com/api/token', body, { headers });
  }

  // Get track details by ID
  getTrack(trackId: string): Observable<any> {
    return this.http.get<any>(`https://api.spotify.com/v1/tracks/${trackId}`, {
      headers: this.headers
    });
  }

  // Get album details by ID
  getAlbum(albumId: string): Observable<any> {
    return this.http.get<any>(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: this.headers
    });
  }

  // Get artist details by ID
  getArtist(artistId: string): Observable<any> {
    return this.http.get<any>(`https://api.spotify.com/v1/artists/${artistId}`, {
      headers: this.headers
    });
  }
}
