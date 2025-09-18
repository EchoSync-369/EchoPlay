import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, combineLatest, takeUntil } from 'rxjs';

// PrimeNG imports
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DataViewModule } from 'primeng/dataview';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { DividerModule } from 'primeng/divider';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

// Application imports
import { FavoritesService } from '../../services/favorites.service';
import { ThemeService } from '../../services/themes/theme.service';
import { 
  Favorite, 
  FavoriteCategory, 
  FavoriteEntityType,
  FavoritesSummary
} from '../../models/favorites.model';

@Component({
  selector: 'app-favorites-dashboard',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
    ButtonModule,
    CardModule,
    DataViewModule,
    DropdownModule,
    SelectButtonModule,
    TagModule,
    TooltipModule,
    ProgressSpinnerModule,
    DividerModule,
    BadgeModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './favorites-dashboard.component.html',
  styleUrls: ['./favorites-dashboard.component.css']
})
export class FavoritesDashboardComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  categories: FavoriteCategory[] = [];
  summary: FavoritesSummary | null = null;

  // View state
  viewMode: 'list' | 'grid' = 'list';
  sortBy: string = 'dateAdded';
  sortOrder: 'asc' | 'desc' = 'desc';

  // Loading and error states
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  // Expose enum for template
  FavoriteEntityType = FavoriteEntityType;

  // Sorting options
  sortOptions = [
    { label: 'Date Added (Newest)', value: 'dateAdded' },
    { label: 'Name (A-Z)', value: 'name' },
    { label: 'Entity Type', value: 'entityType' },
    { label: 'Artist Name', value: 'artistName' }
  ];

  sortOrderOptions = [
    { label: 'Descending', value: 'desc', icon: 'pi pi-sort-amount-down' },
    { label: 'Ascending', value: 'asc', icon: 'pi pi-sort-amount-up' }
  ];

  viewOptions = [
    { label: 'List', value: 'list', icon: 'pi pi-list' },
    { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private favoritesService: FavoritesService, 
    private themeService: ThemeService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {}

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadData() {
    this.isLoading = true;
    this.hasError = false;

    // Load all data concurrently
    combineLatest([
      this.favoritesService.getFavoritesSummary(),
      this.favoritesService.getCategories(),
      this.favoritesService.getFavorites()
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([summary, categories, favorites]) => {
          this.summary = summary;
          this.categories = categories;
          this.favorites = this.sortFavorites(favorites);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.hasError = true;
          this.errorMessage = 'Failed to load favorites data';
          this.isLoading = false;
        }
      });
  }



  onSortChange() {
    this.favorites = this.sortFavorites(this.favorites);
  }

  sortFavorites(favorites: Favorite[]): Favorite[] {
    const sorted = [...favorites].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (this.sortBy) {
        case 'name':
          valueA = a.entityName.toLowerCase();
          valueB = b.entityName.toLowerCase();
          break;
        case 'entityType':
          valueA = a.entityType;
          valueB = b.entityType;
          break;
        case 'artistName':
          valueA = (a.artistName || '').toLowerCase();
          valueB = (b.artistName || '').toLowerCase();
          break;
        case 'dateAdded':
        default:
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
      }

      if (valueA < valueB) {
        return this.sortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return this.sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sorted;
  }

  setViewMode(mode: 'list' | 'grid') {
    this.viewMode = mode;
  }

  removeFavorite(favorite: Favorite) {
    if (confirm(`Remove "${favorite.entityName}" from favorites?`)) {
      this.favoritesService.removeFavorite(favorite.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            // Remove from local array
            this.favorites = this.favorites.filter(f => f.id !== favorite.id);
            // Reload summary
            this.favoritesService.getFavoritesSummary()
              .pipe(takeUntil(this.destroy$))
              .subscribe(summary => this.summary = summary);
          },
          error: (error) => {
            console.error('Error removing favorite:', error);
            alert('Failed to remove favorite. Please try again.');
          }
        });
    }
  }

  trackByFavorite(index: number, favorite: Favorite): number {
    return favorite.id;
  }

  getEntityTypeLabel(entityType: FavoriteEntityType): string {
    switch (entityType) {
      case FavoriteEntityType.Track: return 'Track';
      case FavoriteEntityType.Album: return 'Album';
      case FavoriteEntityType.Artist: return 'Artist';
      default: return 'Unknown';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'today';
    } else if (diffDays === 2) {
      return 'yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  getEntityTypeSeverity(entityType: FavoriteEntityType): string {
    switch (entityType) {
      case FavoriteEntityType.Track: return 'success';
      case FavoriteEntityType.Album: return 'info';
      case FavoriteEntityType.Artist: return 'warning';
      default: return 'secondary';
    }
  }

  confirmRemoveFavorite(favorite: Favorite): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to remove "${favorite.entityName}" from your favorites?`,
      header: 'Confirm Removal',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.removeFavorite(favorite);
      }
    });
  }

  onImageError(event: any, favorite: Favorite): void {
    console.error('Image failed to load for favorite:', favorite.entityName, 'URL:', favorite.imageUrl);
    // Hide the image and show fallback
    event.target.style.display = 'none';
    const fallback = event.target.nextElementSibling;
    if (fallback) {
      fallback.style.display = 'flex';
    }
  }

  onImageLoad(event: any, favorite: Favorite): void {
    console.log('Image loaded successfully for favorite:', favorite.entityName);
  }

  openPlayerForFavorite(favorite: Favorite): void {
    // Navigate to player route based on entity type
    const typeMap = {
      [FavoriteEntityType.Track]: 'track',
      [FavoriteEntityType.Album]: 'album', 
      [FavoriteEntityType.Artist]: 'artist'
    };
    
    const routeType = typeMap[favorite.entityType];
    if (routeType && favorite.spotifyId) {
      this.router.navigate(['/player', routeType, favorite.spotifyId]);
    }
  }
}