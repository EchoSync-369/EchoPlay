import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { SpotifyContext, SpotifyItem } from '../models/favorites.model';

@Injectable({
  providedIn: 'root'
})
export class SpotifyContextService {
  private readonly spotifyApiUrl = 'https://api.spotify.com/v1';

  constructor(private http: HttpClient) {}

  // Extract Spotify context from various URL formats
  detectContext(url: string): SpotifyContext | null {
    try {
      // Handle different Spotify URL formats
      const patterns = {
        track: /(?:track\/|track:)([a-zA-Z0-9]{22})/,
        album: /(?:album\/|album:)([a-zA-Z0-9]{22})/,
        artist: /(?:artist\/|artist:)([a-zA-Z0-9]{22})/
      };

      for (const [type, pattern] of Object.entries(patterns)) {
        const match = url.match(pattern);
        if (match) {
          return {
            type: type as 'track' | 'album' | 'artist',
            id: match[1]
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error detecting Spotify context:', error);
      return null;
    }
  }

  // Extract Spotify ID from URL
  extractSpotifyId(url: string): string | null {
    const context = this.detectContext(url);
    return context?.id || null;
  }

  // Get metadata for Spotify item (requires access token)
  getSpotifyMetadata(context: SpotifyContext, accessToken: string): Observable<SpotifyItem> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    switch (context.type) {
      case 'track':
        return this.getTrackDetails(context.id, headers);
      case 'album':
        return this.getAlbumDetails(context.id, headers);
      case 'artist':
        return this.getArtistDetails(context.id, headers);
      default:
        return throwError(() => new Error(`Unknown context type: ${context.type}`));
    }
  }

  // Get track details from Spotify API
  private getTrackDetails(id: string, headers: HttpHeaders): Observable<SpotifyItem> {
    return this.http.get<any>(`${this.spotifyApiUrl}/tracks/${id}`, { headers })
      .pipe(
        map(track => ({
          id: track.id,
          name: track.name,
          type: 'track' as const,
          artists: track.artists,
          album: track.album,
          duration_ms: track.duration_ms,
          images: track.album?.images
        })),
        catchError(this.handleError)
      );
  }

  // Get album details from Spotify API
  private getAlbumDetails(id: string, headers: HttpHeaders): Observable<SpotifyItem> {
    return this.http.get<any>(`${this.spotifyApiUrl}/albums/${id}`, { headers })
      .pipe(
        map(album => ({
          id: album.id,
          name: album.name,
          type: 'album' as const,
          artists: album.artists,
          images: album.images
        })),
        catchError(this.handleError)
      );
  }

  // Get artist details from Spotify API
  private getArtistDetails(id: string, headers: HttpHeaders): Observable<SpotifyItem> {
    return this.http.get<any>(`${this.spotifyApiUrl}/artists/${id}`, { headers })
      .pipe(
        map(artist => ({
          id: artist.id,
          name: artist.name,
          type: 'artist' as const,
          images: artist.images
        })),
        catchError(this.handleError)
      );
  }

  // Create SpotifyItem from embed URL (for iframe scenarios)
  createSpotifyItemFromEmbed(embedUrl: string): SpotifyItem | null {
    const context = this.detectContext(embedUrl);
    if (!context) return null;

    // Return basic item structure - metadata will need to be fetched separately
    return {
      id: context.id,
      name: 'Unknown', // Will be updated when metadata is fetched
      type: context.type
    };
  }

  // Generate embed URL for Spotify iframe
  generateEmbedUrl(context: SpotifyContext, options?: {
    width?: number;
    height?: number;
    theme?: 'dark' | 'light';
    compact?: boolean;
  }): string {
    const baseUrl = 'https://open.spotify.com/embed';
    const url = `${baseUrl}/${context.type}/${context.id}`;
    
    const params = new URLSearchParams();
    
    if (options?.theme) {
      params.append('theme', options.theme);
    }
    
    if (options?.compact) {
      params.append('utm_source', 'generator');
    }

    const queryString = params.toString();
    return queryString ? `${url}?${queryString}` : url;
  }

  // Validate Spotify ID format
  isValidSpotifyId(id: string): boolean {
    return /^[a-zA-Z0-9]{22}$/.test(id);
  }

  // Get current playing track (requires Spotify Web Playback SDK)
  getCurrentlyPlaying(accessToken: string): Observable<SpotifyItem | null> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    return this.http.get<any>(`${this.spotifyApiUrl}/me/player/currently-playing`, { headers })
      .pipe(
        map(response => {
          if (!response || !response.item) {
            return null;
          }

          const item = response.item;
          return {
            id: item.id,
            name: item.name,
            type: item.type,
            artists: item.artists,
            album: item.album,
            duration_ms: item.duration_ms,
            images: item.album?.images
          };
        }),
        catchError(error => {
          // If no track is playing or user doesn't have Spotify Premium, return null
          if (error.status === 204 || error.status === 403) {
            return of(null);
          }
          return this.handleError(error);
        })
      );
  }

  // Search Spotify (requires access token)
  searchSpotify(query: string, type: 'track' | 'album' | 'artist', accessToken: string, limit: number = 20): Observable<SpotifyItem[]> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${accessToken}`
    });

    const params = new URLSearchParams({
      q: query,
      type: type,
      limit: limit.toString()
    });

    return this.http.get<any>(`${this.spotifyApiUrl}/search?${params}`, { headers })
      .pipe(
        map(response => {
          const items = response[`${type}s`]?.items || [];
          return items.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: type,
            artists: item.artists || (type === 'artist' ? undefined : [item]),
            album: item.album,
            duration_ms: item.duration_ms,
            images: item.images || item.album?.images
          }));
        }),
        catchError(this.handleError)
      );
  }

  // Utility method to get access token from localStorage
  // Note: In a real app, this should come from your auth service
  getStoredAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Check if user has Spotify access token
  hasSpotifyAccess(): boolean {
    return !!this.getStoredAccessToken();
  }

  private handleError(error: any): Observable<never> {
    console.error('SpotifyContextService error:', error);
    return throwError(() => error);
  }
}