import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../services/favorites.service';
import { FavoriteEntityType } from '../../models/favorites.model';
import { Subject, takeUntil } from 'rxjs';

export type FavoriteSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-add-to-favorites',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button 
      class="favorite-btn"
      [class]="'favorite-btn--' + size"
      [class.favorite-btn--active]="isFavorite"
      [class.favorite-btn--loading]="isLoading"
      [disabled]="isLoading"
      (click)="toggleFavorite()"
      [title]="getTooltipText()">
      
      <!-- Loading spinner -->
      <div class="favorite-spinner" *ngIf="isLoading">
        <div class="spinner"></div>
      </div>
      
      <!-- Heart icon -->
      <div class="favorite-icon" *ngIf="!isLoading">
        <svg viewBox="0 0 24 24" class="heart-icon">
          <path 
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            [class.filled]="isFavorite"
          />
        </svg>
      </div>
      
      <!-- Error indicator -->
      <div class="favorite-error" *ngIf="hasError" title="Error occurred">
        ⚠️
      </div>
    </button>
  `,
  styles: [`
    .favorite-btn {
      position: relative;
      border: none;
      background: transparent;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
      padding: 0;
    }

    .favorite-btn:hover:not(:disabled) {
      transform: scale(1.1);
    }

    .favorite-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .favorite-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* Size variations */
    .favorite-btn--small {
      width: 32px;
      height: 32px;
    }

    .favorite-btn--medium {
      width: 40px;
      height: 40px;
    }

    .favorite-btn--large {
      width: 48px;
      height: 48px;
    }

    .favorite-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .heart-icon {
      width: 60%;
      height: 60%;
      transition: all 0.3s ease;
    }

    .heart-icon path {
      fill: none;
      stroke: currentColor;
      stroke-width: 2;
      transition: all 0.3s ease;
    }

    .heart-icon path.filled {
      fill: #ff4757;
      stroke: #ff4757;
      animation: heartBeat 0.6s ease-in-out;
    }

    .favorite-btn--active .heart-icon {
      color: #ff4757;
    }

    .favorite-btn:not(.favorite-btn--active) .heart-icon {
      color: #666;
    }

    .favorite-btn:not(.favorite-btn--active):hover .heart-icon {
      color: #ff4757;
      transform: scale(1.1);
    }

    /* Loading spinner */
    .favorite-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }

    .spinner {
      width: 60%;
      height: 60%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid #ff4757;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes heartBeat {
      0% { transform: scale(1); }
      25% { transform: scale(1.2); }
      50% { transform: scale(1); }
      75% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    /* Error state */
    .favorite-error {
      font-size: 60%;
      opacity: 0.8;
    }

    /* Accessibility */
    .favorite-btn:focus {
      outline: 2px solid #ff4757;
      outline-offset: 2px;
    }

    /* Dark theme adjustments */
    @media (prefers-color-scheme: dark) {
      .favorite-btn:not(.favorite-btn--active) .heart-icon {
        color: #ccc;
      }
    }
  `]
})
export class AddToFavoritesComponent implements OnInit, OnDestroy {
  @Input() spotifyId: string = '';
  @Input() entityType: FavoriteEntityType = FavoriteEntityType.Track;
  @Input() metadata: any = {};
  @Input() size: FavoriteSize = 'medium';
  @Input() disabled: boolean = false;

  @Output() favoriteToggled = new EventEmitter<{ spotifyId: string; isFavorite: boolean }>();

  isFavorite: boolean = false;
  isLoading: boolean = false;
  hasError: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(private favoritesService: FavoritesService) {}

  ngOnInit() {
    if (this.spotifyId) {
      this.checkFavoriteStatus();
    }

    // Subscribe to favorites changes
    this.favoritesService.favorites$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.spotifyId) {
          this.checkFavoriteStatus();
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkFavoriteStatus() {
    this.favoritesService.isFavorite(this.spotifyId, this.entityType)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (isFav) => {
          this.isFavorite = isFav;
          this.hasError = false;
        },
        error: (error) => {
          console.error('Error checking favorite status:', error);
          this.hasError = true;
        }
      });
  }

  toggleFavorite() {
    if (this.isLoading || this.disabled || !this.spotifyId) {
      return;
    }

    this.isLoading = true;
    this.hasError = false;

    if (this.isFavorite) {
      // Find the favorite to remove
      this.favoritesService.favorites$.pipe(takeUntil(this.destroy$)).subscribe(favorites => {
        const favorite = favorites.find(f => 
          f.spotifyId === this.spotifyId && f.entityType === this.entityType
        );
        
        if (favorite) {
          this.favoritesService.removeFavorite(favorite.id)
            .subscribe({
              next: () => {
                this.isFavorite = false;
                this.isLoading = false;
                this.hasError = false;
                
                this.favoriteToggled.emit({
                  spotifyId: this.spotifyId,
                  isFavorite: false
                });
              },
              error: (error: any) => {
                console.error('Error removing favorite:', error);
                this.isLoading = false;
                this.hasError = true;
              }
            });
        } else {
          this.isLoading = false;
          this.hasError = true;
        }
      });
    } else {
      // Add new favorite
      const addRequest = {
        entityType: this.entityType,
        spotifyId: this.spotifyId,
        entityName: this.metadata.name || 'Unknown',
        artistName: this.metadata.artists,
        albumName: this.metadata.album,
        duration: this.metadata.duration,
        imageUrl: this.metadata.image
      };

      this.favoritesService.addFavorite(addRequest)
        .subscribe({
          next: () => {
            this.isFavorite = true;
            this.isLoading = false;
            this.hasError = false;
            
            this.favoriteToggled.emit({
              spotifyId: this.spotifyId,
              isFavorite: true
            });
          },
          error: (error: any) => {
            console.error('Error adding favorite:', error);
            this.isLoading = false;
            this.hasError = true;
          }
        });
    }
  }

  getTooltipText(): string {
    if (this.hasError) {
      return 'Error occurred - click to retry';
    }
    if (this.isLoading) {
      return 'Processing...';
    }
    return this.isFavorite ? 'Remove from favorites' : 'Add to favorites';
  }
}