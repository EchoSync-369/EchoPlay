import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import {
  Favorite,
  FavoriteCategory,
  AddFavoriteRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  MoveFavoriteRequest,
  FavoritesSummary,
  FavoritesGrouped,
  FavoriteEntityType,
  SpotifyItem
} from '../models/favorites.model';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly apiUrl = 'https://localhost:7244/api';
  private readonly favoritesSubject = new BehaviorSubject<Favorite[]>([]);
  private readonly categoriesSubject = new BehaviorSubject<FavoriteCategory[]>([]);
  private readonly summarySubject = new BehaviorSubject<FavoritesSummary | null>(null);

  // Public observables
  public favorites$ = this.favoritesSubject.asObservable();
  public categories$ = this.categoriesSubject.asObservable();
  public summary$ = this.summarySubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadInitialData();
  }

  // Get current user email from localStorage (you might want to get this from auth service)
  private getCurrentUserEmail(): string {
    // This should come from your auth service
    return 'iluisflores@yahoo.com'; // Replace with actual user email from auth
  }

  private getHttpParams(additionalParams?: { [key: string]: string }): HttpParams {
    let params = new HttpParams().set('email', this.getCurrentUserEmail());
    
    if (additionalParams) {
      Object.keys(additionalParams).forEach(key => {
        params = params.set(key, additionalParams[key]);
      });
    }
    
    return params;
  }

  // Initialize data
  private loadInitialData(): void {
    this.refreshFavorites(); // Load favorites first so isFavorite() works correctly
    this.refreshSummary();
    this.refreshCategories();
  }

  // === FAVORITES METHODS ===

  // Get favorites summary
  getFavoritesSummary(): Observable<FavoritesSummary> {
    const params = this.getHttpParams();
    return this.http.get<FavoritesSummary>(`${this.apiUrl}/favorites/summary`, { params })
      .pipe(
        tap(summary => this.summarySubject.next(summary)),
        catchError(this.handleError)
      );
  }

  // Get all favorites
  getFavorites(entityType?: FavoriteEntityType, categoryId?: number): Observable<Favorite[]> {
    let additionalParams: { [key: string]: string } = {};
    
    if (entityType !== undefined) {
      additionalParams['entityType'] = entityType.toString();
    }
    if (categoryId !== undefined) {
      additionalParams['categoryId'] = categoryId.toString();
    }

    const params = this.getHttpParams(additionalParams);
    
    return this.http.get<Favorite[]>(`${this.apiUrl}/favorites`, { params })
      .pipe(
        map(favorites => favorites.map(f => ({ ...f, createdAt: new Date(f.createdAt) }))),
        tap(favorites => this.favoritesSubject.next(favorites)),
        catchError(this.handleError)
      );
  }

  // Get grouped favorites
  getFavoritesGrouped(): Observable<FavoritesGrouped[]> {
    const params = this.getHttpParams();
    return this.http.get<FavoritesGrouped[]>(`${this.apiUrl}/favorites/grouped`, { params })
      .pipe(
        map(groups => groups.map(group => ({
          ...group,
          favorites: group.favorites.map(f => ({ ...f, createdAt: new Date(f.createdAt) }))
        }))),
        catchError(this.handleError)
      );
  }

  // Add favorite
  addFavorite(request: AddFavoriteRequest): Observable<Favorite> {
    const params = this.getHttpParams();
    return this.http.post<Favorite>(`${this.apiUrl}/favorites`, request, { params })
      .pipe(
        map(favorite => ({ ...favorite, createdAt: new Date(favorite.createdAt) })),
        tap(() => {
          this.refreshFavorites();
          this.refreshSummary();
        }),
        catchError(this.handleError)
      );
  }

  // Remove favorite
  removeFavorite(id: number): Observable<void> {
    const params = this.getHttpParams();
    return this.http.delete<void>(`${this.apiUrl}/favorites/${id}`, { params })
      .pipe(
        tap(() => {
          this.refreshFavorites();
          this.refreshSummary();
        }),
        catchError(this.handleError)
      );
  }

  // Move favorite to different category
  moveFavorite(id: number, request: MoveFavoriteRequest): Observable<void> {
    const params = this.getHttpParams();
    return this.http.put<void>(`${this.apiUrl}/favorites/${id}/move`, request, { params })
      .pipe(
        tap(() => this.refreshFavorites()),
        catchError(this.handleError)
      );
  }

  // Check if item is favorited
  isFavorite(spotifyId: string, entityType: FavoriteEntityType): Observable<boolean> {
    return this.favorites$.pipe(
      map(favorites => favorites.some(f => 
        f.spotifyId === spotifyId && f.entityType === entityType
      ))
    );
  }

  // Toggle favorite (add or remove)
  toggleFavorite(item: SpotifyItem, categoryId?: number): Observable<boolean> {
    const entityType = this.getEntityTypeFromSpotifyType(item.type);
    const current = this.favoritesSubject.value;
    const existing = current.find(f => f.spotifyId === item.id && f.entityType === entityType);

    if (existing) {
      return this.removeFavorite(existing.id).pipe(map(() => false));
    } else {
      const request: AddFavoriteRequest = {
        entityType,
        spotifyId: item.id,
        entityName: item.name,
        artistName: this.getArtistName(item),
        albumName: this.getAlbumName(item),
        duration: item.duration_ms,
        imageUrl: this.getImageUrl(item),
        categoryId
      };
      
      return this.addFavorite(request).pipe(map(() => true));
    }
  }

  // === CATEGORIES METHODS ===

  // Get all categories
  getCategories(): Observable<FavoriteCategory[]> {
    const params = this.getHttpParams();
    return this.http.get<FavoriteCategory[]>(`${this.apiUrl}/categories`, { params })
      .pipe(
        map(categories => categories.map(c => ({ ...c, createdAt: new Date(c.createdAt) }))),
        tap(categories => this.categoriesSubject.next(categories)),
        catchError(this.handleError)
      );
  }

  // Get single category
  getCategory(id: number): Observable<FavoriteCategory> {
    const params = this.getHttpParams();
    return this.http.get<FavoriteCategory>(`${this.apiUrl}/categories/${id}`, { params })
      .pipe(
        map(category => ({ ...category, createdAt: new Date(category.createdAt) })),
        catchError(this.handleError)
      );
  }

  // Create category
  createCategory(request: CreateCategoryRequest): Observable<FavoriteCategory> {
    const params = this.getHttpParams();
    return this.http.post<FavoriteCategory>(`${this.apiUrl}/categories`, request, { params })
      .pipe(
        map(category => ({ ...category, createdAt: new Date(category.createdAt) })),
        tap(() => this.refreshCategories()),
        catchError(this.handleError)
      );
  }

  // Update category
  updateCategory(id: number, request: UpdateCategoryRequest): Observable<void> {
    const params = this.getHttpParams();
    return this.http.put<void>(`${this.apiUrl}/categories/${id}`, request, { params })
      .pipe(
        tap(() => this.refreshCategories()),
        catchError(this.handleError)
      );
  }

  // Delete category
  deleteCategory(id: number, moveFavoritesToUncategorized: boolean = true): Observable<void> {
    const params = this.getHttpParams({ 
      moveFavoritesToUncategorized: moveFavoritesToUncategorized.toString() 
    });
    return this.http.delete<void>(`${this.apiUrl}/categories/${id}`, { params })
      .pipe(
        tap(() => {
          this.refreshCategories();
          this.refreshFavorites();
          this.refreshSummary();
        }),
        catchError(this.handleError)
      );
  }

  // === UTILITY METHODS ===

  // Refresh data
  refreshFavorites(): void {
    this.getFavorites().subscribe();
  }

  refreshCategories(): void {
    this.getCategories().subscribe();
  }

  refreshSummary(): void {
    this.getFavoritesSummary().subscribe();
  }

  refreshAll(): void {
    this.refreshFavorites();
    this.refreshCategories();
    this.refreshSummary();
  }

  // Convert Spotify type to our enum
  private getEntityTypeFromSpotifyType(spotifyType: string): FavoriteEntityType {
    switch (spotifyType) {
      case 'track': return FavoriteEntityType.Track;
      case 'artist': return FavoriteEntityType.Artist;
      case 'album': return FavoriteEntityType.Album;
      default: throw new Error(`Unknown Spotify type: ${spotifyType}`);
    }
  }

  // Extract metadata from Spotify item
  private getArtistName(item: SpotifyItem): string | undefined {
    if (item.type === 'artist') return undefined;
    return item.artists?.[0]?.name || item.album?.artists?.[0]?.name;
  }

  private getAlbumName(item: SpotifyItem): string | undefined {
    if (item.type !== 'track') return undefined;
    return item.album?.name;
  }

  private getImageUrl(item: SpotifyItem): string | undefined {
    const images = item.images || item.album?.images;
    return images?.[0]?.url;
  }

  // Error handling
  private handleError(error: any): Observable<never> {
    console.error('FavoritesService error:', error);
    return throwError(() => error);
  }
}