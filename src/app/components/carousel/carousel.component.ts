import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/themes/theme.service';
import { AddToFavoritesComponent } from '../add-to-favorites/add-to-favorites.component';
import { FavoriteEntityType } from '../../models/favorites.model';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule, CommonModule, AddToFavoritesComponent],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent implements OnInit, OnDestroy {
  @Input() data: any[] = [];

  numVisible: number;
  responsiveOptions: any[];
  isDarkMode: boolean = false;
  constructor(private router: Router, private themeService: ThemeService) {
    this.numVisible = this.getNumVisible();
    this.isDarkMode = this.themeService.isDarkMode();

    this.responsiveOptions = [
      {
        breakpoint: '1200px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '900px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '600px',
        numVisible: 1,
        numScroll: 1
      }
    ];
    window.addEventListener('resize', this.onResize.bind(this));
  }
  ngOnInit(): void {
    this.updateTheme();
    this.observeThemeChanges();
  }

  private observeThemeChanges(): void {
    const observer = new MutationObserver(() => {
      this.updateTheme();
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    (this as any).themeObserver = observer;
  }

  onCardClick(card: { type: string; id: string } | undefined): void {
    if (card && card.type && card.id) {
      this.router.navigate(['/player', card.type, card.id]);
      console.log("Selected Card", card);
    }
  }

  onFavoriteToggle(event: { spotifyId: string; isFavorite: boolean }): void {
    console.log('Favorite toggled from carousel:', event);
  }

  getEntityType(data: any): FavoriteEntityType {
    // Determine entity type based on the data structure
    // Albums typically have 'album_type' or we can check if it has 'type' property
    if (data.album_type || data.type === 'album') {
      return FavoriteEntityType.Album;
    } else if (data.type === 'artist') {
      return FavoriteEntityType.Artist;
    } else {
      // Default to track for most items
      return FavoriteEntityType.Track;
    }
  }

  getMetadata(data: any): any {
    return {
      name: data.name,
      artists: data.artists ? data.artists.map((artist: any) => artist.name).join(', ') : 'Unknown Artist',
      album: data.album?.name || data.name, // Use album name if available, otherwise use the item name
      image: data.images && data.images.length > 0 ? data.images[0].url : null
    };
  }

  getCurrentTheme(): string {
    return this.isDarkMode ? 'dark' : 'light';
  }
  updateTheme(): void {
    this.isDarkMode = this.themeService.isDarkMode();
  }

  refreshTheme(): void {
    this.updateTheme();
  }

  private getNumVisible() {
    const width = window.innerWidth;
    const cardWidth = 260 + 16;
    const availableWidth = width - 120;
    const maxCards = Math.floor(availableWidth / cardWidth);

    if (width < 600) {
      return Math.min(1, maxCards);
    } else if (width < 900) {
      return Math.min(2, maxCards);
    } else if (width < 1200) {
      return Math.min(3, maxCards);
    } else if (width < 1600) {
      return Math.min(4, maxCards);
    } else if (width < 2000) {
      return Math.min(5, maxCards);
    } else {
      return Math.min(6, maxCards);
    }
  }

  private onResize() {
    this.numVisible = this.getNumVisible();
  }
  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));

    if ((this as any).themeObserver) {
      (this as any).themeObserver.disconnect();
    }
  }
}
