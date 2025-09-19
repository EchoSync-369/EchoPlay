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
  templateUrl: './add-to-favorites.component.html',
  styleUrls: ['./add-to-favorites.component.css']
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