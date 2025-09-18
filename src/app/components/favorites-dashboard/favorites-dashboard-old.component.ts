import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { ThemeService } from '../../services/themes/theme.service';
import { 
  Favorite, 
  FavoriteCategory, 
  FavoriteEntityType, 
  FavoritesSummary,
  FavoritesGrouped 
} from '../../models/favorites.model';
import { Subject, takeUntil, combineLatest } from 'rxjs';

// PrimeNG Imports
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
    <div class="favorites-dashboard">
      <!-- Header Section -->
      <div class="dashboard-header">
        <div class="header-content">
          <h1 class="dashboard-title">
            <i class="pi pi-heart-fill" style="color: var(--primary-color)"></i>
            My Favorites
          </h1>
          <p class="dashboard-subtitle">Discover and manage your favorite music</p>
        </div>

        <!-- Summary Cards -->
        <div class="summary-stats" *ngIf="summary">
          <p-card styleClass="summary-card">
            <div class="stat-content">
              <div class="stat-number">{{ summary.totalFavorites }}</div>
              <div class="stat-label">Total Items</div>
            </div>
          </p-card>
          
          <p-card styleClass="summary-card">
            <div class="stat-content">
              <div class="stat-number">{{ summary.tracksCount }}</div>
              <div class="stat-label">Tracks</div>
            </div>
          </p-card>
          
          <p-card styleClass="summary-card">
            <div class="stat-content">
              <div class="stat-number">{{ summary.albumsCount }}</div>
              <div class="stat-label">Albums</div>
            </div>
          </p-card>
          
          <p-card styleClass="summary-card">
            <div class="stat-content">
              <div class="stat-number">{{ summary.artistsCount }}</div>
              <div class="stat-label">Artists</div>
            </div>
          </p-card>
        </div>
      </div>

      <p-divider></p-divider>

      <!-- Controls Section -->
      <div class="dashboard-controls">
        <div class="filters-section">
          <div class="filter-group">
            <label for="typeFilter">Filter by Type:</label>
            <p-dropdown 
              id="typeFilter"
              [options]="entityTypeOptions" 
              [(ngModel)]="selectedEntityType" 
              (onChange)="onFilterChange()"
              placeholder="All Types"
              [showClear]="true"
              styleClass="filter-dropdown">
            </p-dropdown>
          </div>

          <div class="filter-group">
            <label for="categoryFilter">Filter by Category:</label>
            <p-dropdown 
              id="categoryFilter"
              [options]="categoryOptions" 
              [(ngModel)]="selectedCategory" 
              (onChange)="onFilterChange()"
              placeholder="All Categories"
              [showClear]="true"
              styleClass="filter-dropdown">
            </p-dropdown>
          </div>
        </div>

        <div class="view-controls">
          <label>View:</label>
          <p-selectButton 
            [options]="viewOptions" 
            [(ngModel)]="viewMode" 
            (onChange)="onViewModeChange()"
            optionLabel="label" 
            optionValue="value">
          </p-selectButton>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading">
        <p-progressSpinner 
          [style]="{'width': '50px', 'height': '50px'}" 
          strokeWidth="3" 
          animationDuration="1s">
        </p-progressSpinner>
        <p class="loading-text">Loading your favorites...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="!isLoading && favorites.length === 0">
        <div class="empty-content">
          <i class="pi pi-heart" style="font-size: 4rem; color: var(--text-color-secondary)"></i>
          <h2>No favorites yet</h2>
          <p>Start exploring music and add your favorites to see them here!</p>
          <p-button 
            label="Explore Music" 
            icon="pi pi-search" 
            [routerLink]="['/search']"
            styleClass="p-button-outlined">
          </p-button>
        </div>
      </div>

      <!-- Favorites Content -->
      <div class="favorites-content" *ngIf="!isLoading && favorites.length > 0">
        
        <!-- List View -->
        <div class="favorites-list" *ngIf="viewMode === 'list'">
          <p-card 
            *ngFor="let favorite of favorites; trackBy: trackByFavorite" 
            styleClass="favorite-list-item">
            <div class="list-item-content">
              <div class="item-info">
                <img 
                  *ngIf="favorite.imageUrl" 
                  [src]="favorite.imageUrl" 
                  [alt]="favorite.entityName"
                  class="item-image"
                  loading="lazy"
                  (error)="onImageError($event, favorite)"
                  (load)="onImageLoad($event, favorite)">
                <div class="item-fallback" *ngIf="!favorite.imageUrl">
                  <i class="pi pi-image"></i>
                </div>
                
                <div class="item-details">
                  <h3 class="item-title">{{ favorite.entityName }}</h3>
                  <div class="item-meta">
                    <p-tag 
                      [value]="getEntityTypeLabel(favorite.entityType)" 
                      [severity]="getEntityTypeSeverity(favorite.entityType)"
                      [rounded]="true">
                    </p-tag>
                    <span *ngIf="favorite.artistName" class="meta-text">{{ favorite.artistName }}</span>
                    <span *ngIf="favorite.albumName" class="meta-text">{{ favorite.albumName }}</span>
                  </div>
                  <small class="item-date">Added {{ formatDate(favorite.createdAt) }}</small>
                </div>
              </div>
              
              <div class="item-actions">
                <p-tag 
                  *ngIf="favorite.category" 
                  [value]="favorite.category.name"
                  severity="info"
                  [rounded]="true">
                </p-tag>
                <p-button 
                  icon="pi pi-trash" 
                  severity="danger"
                  size="small"
                  [text]="true"
                  [rounded]="true"
                  (onClick)="confirmRemoveFavorite(favorite)"
                  pTooltip="Remove from favorites"
                  tooltipPosition="top">
                </p-button>
              </div>
            </div>
          </p-card>
        </div>

        <!-- Grid View -->
        <div class="favorites-grid" *ngIf="viewMode === 'grid'">
          <p-card 
            *ngFor="let favorite of favorites; trackBy: trackByFavorite" 
            styleClass="favorite-grid-item">
            <ng-template pTemplate="header">
              <div class="grid-card-header">
                <img 
                  *ngIf="favorite.imageUrl" 
                  [src]="favorite.imageUrl" 
                  [alt]="favorite.entityName"
                  class="grid-item-image"
                  loading="lazy"
                  (error)="onImageError($event, favorite)"
                  (load)="onImageLoad($event, favorite)">
                <div class="grid-fallback" *ngIf="!favorite.imageUrl">
                  <i class="pi pi-image"></i>
                </div>
                <div class="grid-overlay">
                  <p-tag 
                    [value]="getEntityTypeLabel(favorite.entityType)" 
                    [severity]="getEntityTypeSeverity(favorite.entityType)"
                    [rounded]="true"
                    styleClass="entity-badge">
                  </p-tag>
                </div>
              </div>
            </ng-template>
            
            <div class="grid-card-content">
              <h4 class="grid-title">{{ favorite.entityName }}</h4>
              <p class="grid-subtitle" *ngIf="favorite.artistName">{{ favorite.artistName }}</p>
              <p class="grid-album" *ngIf="favorite.albumName">{{ favorite.albumName }}</p>
            </div>

            <ng-template pTemplate="footer">
              <div class="grid-card-footer">
                <p-tag 
                  *ngIf="favorite.category" 
                  [value]="favorite.category.name"
                  severity="info"
                  size="small"
                  [rounded]="true">
                </p-tag>
                <p-button 
                  icon="pi pi-trash" 
                  severity="danger"
                  size="small"
                  [text]="true"
                  [rounded]="true"
                  (onClick)="confirmRemoveFavorite(favorite)"
                  pTooltip="Remove from favorites">
                </p-button>
              </div>
            </ng-template>
          </p-card>
        </div>

        <!-- Grouped View -->
        <div class="favorites-grouped" *ngIf="viewMode === 'grouped'">
          <div class="group-section" *ngFor="let group of groupedFavorites">
            <div class="group-header">
              <h3 class="group-title">
                <i class="pi pi-folder" style="color: var(--primary-color)"></i>
                {{ group.category?.name || 'Uncategorized' }}
              </h3>
              <p-badge [value]="group.favorites.length" severity="info"></p-badge>
            </div>
            
            <div class="group-content">
              <p-card 
                *ngFor="let favorite of group.favorites; trackBy: trackByFavorite" 
                styleClass="grouped-item">
                <div class="grouped-item-content">
                  <div class="grouped-info">
                    <img 
                      *ngIf="favorite.imageUrl" 
                      [src]="favorite.imageUrl" 
                      [alt]="favorite.entityName"
                      class="grouped-image"
                      loading="lazy"
                      (error)="onImageError($event, favorite)"
                      (load)="onImageLoad($event, favorite)">
                    <div class="grouped-fallback" *ngIf="!favorite.imageUrl">
                      <i class="pi pi-image"></i>
                    </div>
                    
                    <div class="grouped-details">
                      <h4 class="grouped-title">{{ favorite.entityName }}</h4>
                      <div class="grouped-meta">
                        <p-tag 
                          [value]="getEntityTypeLabel(favorite.entityType)" 
                          [severity]="getEntityTypeSeverity(favorite.entityType)"
                          size="small"
                          [rounded]="true">
                        </p-tag>
                        <span *ngIf="favorite.artistName" class="meta-text">{{ favorite.artistName }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p-button 
                    icon="pi pi-trash" 
                    severity="danger"
                    size="small"
                    [text]="true"
                    [rounded]="true"
                    (onClick)="confirmRemoveFavorite(favorite)"
                    pTooltip="Remove from favorites">
                  </p-button>
                </div>
              </p-card>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div class="error-state" *ngIf="hasError">
        <div class="error-content">
          <i class="pi pi-exclamation-triangle" style="font-size: 4rem; color: var(--red-500)"></i>
          <h2>Oops! Something went wrong</h2>
          <p>{{ errorMessage }}</p>
          <p-button 
            label="Try Again" 
            icon="pi pi-refresh" 
            (onClick)="loadData()"
            severity="danger">
          </p-button>
        </div>
      </div>

      <!-- Confirmation Dialog -->
      <p-confirmDialog 
        [style]="{'width': '50vw'}"
        [baseZIndex]="10000"
        rejectButtonStyleClass="p-button-text">
      </p-confirmDialog>
    </div>
  `,
  styles: [`
    .favorites-dashboard {
      padding: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    /* Header Section */
    .dashboard-header {
      margin-bottom: 2rem;
    }

    .header-content {
      text-align: center;
      margin-bottom: 2rem;
    }

    .dashboard-title {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin: 0 0 0.5rem 0;
      font-size: 2.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .dashboard-subtitle {
      color: var(--text-color-secondary);
      font-size: 1.1rem;
      margin: 0;
    }

    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .summary-card {
      --p-card-body-padding: 1.25rem;
    }

    .stat-content {
      text-align: center;
    }

    .stat-number {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary-color);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Controls Section */
    .dashboard-controls {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filters-section {
      display: flex;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 180px;
    }

    .filter-group label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
    }

    .filter-dropdown {
      min-width: 180px;
    }

    .view-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .view-controls label {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-color);
    }

    /* Loading and Empty States */
    .loading-container, .empty-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .loading-text {
      margin-top: 1rem;
      color: var(--text-color-secondary);
      font-size: 1rem;
    }

    .empty-content, .error-content {
      max-width: 400px;
    }

    .empty-content h2, .error-content h2 {
      margin: 1.5rem 0 1rem 0;
      color: var(--text-color);
    }

    .empty-content p, .error-content p {
      color: var(--text-color-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    /* List View */
    .favorites-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .favorite-list-item {
      --p-card-body-padding: 1.25rem;
    }

    .list-item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .item-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .item-image {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      object-fit: cover;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .item-fallback {
      width: 60px;
      height: 60px;
      border-radius: 8px;
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      font-size: 1.5rem;
    }

    .item-details {
      flex: 1;
    }

    .item-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .item-meta {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
      flex-wrap: wrap;
    }

    .meta-text {
      color: var(--text-color-secondary);
      font-size: 0.875rem;
    }

    .item-date {
      color: var(--text-color-secondary);
      font-size: 0.75rem;
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Grid View */
    .favorites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .favorite-grid-item {
      --p-card-body-padding: 0;
      --p-card-content-padding: 1rem;
      --p-card-footer-padding: 1rem;
      height: 100%;
    }

    .grid-card-header {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .grid-item-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .grid-fallback {
      width: 100%;
      height: 100%;
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      font-size: 2rem;
    }

    .grid-overlay {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
    }

    .entity-badge {
      background: rgba(0, 0, 0, 0.7) !important;
      backdrop-filter: blur(4px);
    }

    .grid-card-content {
      padding: 1rem;
    }

    .grid-title {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: var(--text-color);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .grid-subtitle, .grid-album {
      margin: 0.25rem 0;
      color: var(--text-color-secondary);
      font-size: 0.875rem;
      display: -webkit-box;
      -webkit-line-clamp: 1;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .grid-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      border-top: 1px solid var(--surface-border);
    }

    /* Grouped View */
    .favorites-grouped {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .group-section {
      background: var(--surface-50);
      border-radius: 12px;
      padding: 1.5rem;
    }

    .group-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--surface-border);
    }

    .group-title {
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .group-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .grouped-item {
      --p-card-body-padding: 1rem;
    }

    .grouped-item-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .grouped-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .grouped-image {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      object-fit: cover;
    }

    .grouped-fallback {
      width: 50px;
      height: 50px;
      border-radius: 6px;
      background: var(--surface-200);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-color-secondary);
      font-size: 1.25rem;
    }

    .grouped-details {
      flex: 1;
    }

    .grouped-title {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .grouped-meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .favorites-dashboard {
        padding: 1rem;
      }

      .dashboard-controls {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .filters-section {
        flex-direction: column;
        gap: 1rem;
      }

      .view-controls {
        justify-content: center;
      }

      .summary-stats {
        grid-template-columns: repeat(2, 1fr);
      }

      .dashboard-title {
        font-size: 2rem;
      }

      .favorites-grid {
        grid-template-columns: 1fr;
      }

      .list-item-content {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .item-info {
        flex-direction: column;
        text-align: center;
      }

      .item-actions {
        justify-content: center;
      }
    }

    @media (max-width: 480px) {
      .summary-stats {
        grid-template-columns: 1fr;
      }

      .grid-card-header {
        height: 150px;
      }
    }

    /* Dark theme adjustments */
    [data-theme="dark"] .group-section {
      background: var(--surface-100);
    }

    [data-theme="dark"] .entity-badge {
      background: rgba(255, 255, 255, 0.15) !important;
    }
  `]
})
export class FavoritesDashboardComponent implements OnInit, OnDestroy {
  favorites: Favorite[] = [];
  categories: FavoriteCategory[] = [];
  summary: FavoritesSummary | null = null;
  groupedFavorites: FavoritesGrouped[] = [];

  // View state
  viewMode: 'list' | 'grid' | 'grouped' = 'list';
  selectedEntityType: FavoriteEntityType | null = null;
  selectedCategory: number | null = null;

  // Loading and error states
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';

  // Expose enum for template
  FavoriteEntityType = FavoriteEntityType;

  // Dropdown options
  entityTypeOptions = [
    { label: 'Tracks', value: FavoriteEntityType.Track },
    { label: 'Albums', value: FavoriteEntityType.Album },
    { label: 'Artists', value: FavoriteEntityType.Artist }
  ];

  categoryOptions: { label: string; value: number }[] = [];

  viewOptions = [
    { label: 'List', value: 'list', icon: 'pi pi-list' },
    { label: 'Grid', value: 'grid', icon: 'pi pi-th-large' },
    { label: 'Grouped', value: 'grouped', icon: 'pi pi-sitemap' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private favoritesService: FavoritesService, 
    private themeService: ThemeService,
    private confirmationService: ConfirmationService
  ) {}

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
      this.favoritesService.getFavorites(
        this.selectedEntityType ? this.selectedEntityType : undefined,
        this.selectedCategory ? Number(this.selectedCategory) : undefined
      )
    ]).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([summary, categories, favorites]) => {
          this.summary = summary;
          this.categories = categories;
          this.favorites = favorites;
          this.isLoading = false;
          
          // Update category options for dropdown
          this.categoryOptions = categories.map(category => ({
            label: category.name,
            value: category.id
          }));
          
          // Load grouped data if needed
          if (this.viewMode === 'grouped') {
            this.loadGroupedFavorites();
          }
        },
        error: (error) => {
          console.error('Error loading dashboard data:', error);
          this.hasError = true;
          this.errorMessage = 'Failed to load favorites data';
          this.isLoading = false;
        }
      });
  }

  loadGroupedFavorites() {
    this.favoritesService.getFavoritesGrouped()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (grouped) => {
          this.groupedFavorites = grouped;
        },
        error: (error) => {
          console.error('Error loading grouped favorites:', error);
        }
      });
  }

  onFilterChange() {
    this.loadData();
  }

  setViewMode(mode: 'list' | 'grid' | 'grouped') {
    this.viewMode = mode;
    if (mode === 'grouped' && this.groupedFavorites.length === 0) {
      this.loadGroupedFavorites();
    }
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

  onViewModeChange(): void {
    // This method is called when the view mode changes via p-selectButton
    // The viewMode property is already updated via ngModel binding
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
}