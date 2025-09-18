import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { FavoritesService } from '../../services/favorites.service';
import { FavoriteEntityType, SpotifyItem, FavoriteButtonState } from '../../models/favorites.model';

@Component({
  selector: 'app-add-to-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="favorite-btn"
      [class.favorited]="state.isFavorited"
      [class.loading]="state.loading"
      [class.error]="state.error"
      [disabled]="state.loading || !spotifyItem"
      (click)="toggleFavorite()"
      [title]="getTooltipText()">
      
      <!-- Heart Icon -->
      <svg *ngIf="!state.loading" 
           class="heart-icon" 
           [class.filled]="state.isFavorited"
           viewBox="0 0 24 24" 
           width="20" 
           height="20">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
      
      <!-- Loading Spinner -->
      <div *ngIf="state.loading" class="spinner"></div>
      
      <!-- Tooltip -->
      <div class="tooltip" [class.visible]="showTooltip">
        {{ getTooltipText() }}
      </div>
    </button>
  `,
  styles: [`
    .favorite-btn {
      position: relative;
      background: rgba(0, 0, 0, 0.7);
      border: none;
      border-radius: 50%;
      padding: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .favorite-btn:hover {
      background: rgba(0, 0, 0, 0.8);
      transform: scale(1.1);
    }

    .favorite-btn:active {
      transform: scale(0.95);
    }

    .favorite-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    .heart-icon {
      fill: #ffffff;
      transition: all 0.2s ease;
    }

    .heart-icon.filled {
      fill: #1db954; /* Spotify green */
      filter: drop-shadow(0 0 4px rgba(29, 185, 84, 0.4));
    }

    .favorite-btn.favorited .heart-icon {
      animation: heartbeat 0.6s ease-in-out;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid #ffffff;
      border-top: 2px solid transparent;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .tooltip {
      position: absolute;
      bottom: 110%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
    }

    .favorite-btn:hover .tooltip {
      opacity: 1;
    }

    .tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: rgba(0, 0, 0, 0.9);
    }

    .favorite-btn.error {
      background: rgba(220, 53, 69, 0.7);
    }

    .favorite-btn.error:hover {
      background: rgba(220, 53, 69, 0.8);
    }

    @keyframes heartbeat {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Size variants */
    .favorite-btn.small {
      padding: 6px;
    }

    .favorite-btn.small .heart-icon {
      width: 16px;
      height: 16px;
    }

    .favorite-btn.large {
      padding: 12px;
    }

    .favorite-btn.large .heart-icon {
      width: 24px;
      height: 24px;
    }
  `]
})
export class AddToFavoritesComponent implements OnInit, OnDestroy {
  @Input() spotifyItem: SpotifyItem | null = null;
  @Input() categoryId?: number;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Output() favoriteToggled = new EventEmitter<{ item: SpotifyItem, isFavorited: boolean }>();

  state: FavoriteButtonState = {
    isFavorited: false,
    loading: false
  };

  showTooltip = false;
  private destroy$ = new Subject<void>();

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit(): void {
    if (this.spotifyItem) {
      this.checkFavoriteStatus();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkFavoriteStatus(): void {
    if (!this.spotifyItem) return;

    const entityType = this.getEntityType(this.spotifyItem.type);
    
    this.favoritesService.isFavorite(this.spotifyItem.id, entityType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isFavorited) => {
          this.state = { ...this.state, isFavorited, loading: false, error: undefined };
        },
        error: (error) => {
          this.state = { ...this.state, loading: false, error: 'Failed to check status' };
          console.error('Error checking favorite status:', error);
        }
      });
  }

  toggleFavorite(): void {
    if (!this.spotifyItem || this.state.loading) return;

    this.state = { ...this.state, loading: true, error: undefined };

    this.favoritesService.toggleFavorite(this.spotifyItem, this.categoryId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isFavorited) => {
          this.state = { 
            ...this.state, 
            isFavorited, 
            loading: false, 
            error: undefined 
          };
          
          this.favoriteToggled.emit({ 
            item: this.spotifyItem!, 
            isFavorited 
          });
        },
        error: (error) => {
          this.state = { 
            ...this.state, 
            loading: false, 
            error: 'Failed to update favorite' 
          };
          
          console.error('Error toggling favorite:', error);
          
          // Revert optimistic update after a delay
          setTimeout(() => {
            this.checkFavoriteStatus();
          }, 2000);
        }
      });
  }

  getTooltipText(): string {
    if (this.state.loading) {
      return 'Updating...';
    }
    
    if (this.state.error) {
      return this.state.error;
    }
    
    if (!this.spotifyItem) {
      return 'No item selected';
    }
    
    const action = this.state.isFavorited ? 'Remove from' : 'Add to';
    return `${action} favorites`;
  }

  private getEntityType(spotifyType: string): FavoriteEntityType {
    switch (spotifyType) {
      case 'track': return FavoriteEntityType.Track;
      case 'artist': return FavoriteEntityType.Artist;
      case 'album': return FavoriteEntityType.Album;
      default: throw new Error(`Unknown Spotify type: ${spotifyType}`);
    }
  }
}