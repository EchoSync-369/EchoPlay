// Enums
export enum FavoriteEntityType {
  Track = 0,
  Artist = 1,
  Album = 2
}

// Core Models
export interface Favorite {
  id: number;
  entityType: FavoriteEntityType;
  spotifyId: string;
  entityName: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  imageUrl?: string;
  createdAt: Date;
  category?: FavoriteCategory;
}

export interface FavoriteCategory {
  id: number;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  favoritesCount: number;
}

// Request DTOs
export interface AddFavoriteRequest {
  entityType: FavoriteEntityType;
  spotifyId: string;
  entityName: string;
  artistName?: string;
  albumName?: string;
  duration?: number;
  imageUrl?: string;
  categoryId?: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  color: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  color: string;
}

export interface MoveFavoriteRequest {
  categoryId?: number;
}

// Response DTOs
export interface FavoritesSummary {
  totalFavorites: number;
  tracksCount: number;
  artistsCount: number;
  albumsCount: number;
  categoriesCount: number;
  categories: FavoriteCategory[];
}

export interface FavoritesGrouped {
  category?: FavoriteCategory;
  favorites: Favorite[];
}

// UI Types
export type ViewMode = 'list' | 'grid' | 'grouped';

export interface GroupedFavorites {
  category?: FavoriteCategory;
  favorites: Favorite[];
}

// Spotify Context
export interface SpotifyContext {
  type: 'track' | 'album' | 'artist';
  id: string;
}

export interface SpotifyItem {
  id: string;
  name: string;
  type: 'track' | 'album' | 'artist';
  artists?: SpotifyArtist[];
  album?: SpotifyAlbum;
  duration_ms?: number;
  images?: SpotifyImage[];
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images?: SpotifyImage[];
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  images?: SpotifyImage[];
}

export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

// UI State
export interface FavoriteButtonState {
  isFavorited: boolean;
  loading: boolean;
  error?: string;
}