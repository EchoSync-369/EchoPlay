import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute, NavigationEnd } from "@angular/router";
import { ThemeButtonComponent } from "../theme-button/theme-button.component";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { AddToFavoritesComponent } from "../add-to-favorites/add-to-favorites.component";
import { UserProfileDropdownComponent } from "../user-profile-dropdown/user-profile-dropdown.component";
import { CommonModule } from "@angular/common";
import { Subject, takeUntil, filter } from "rxjs";
import { FavoriteEntityType } from "../../models/favorites.model";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";
import { HttpClient } from '@angular/common/http';
import { UserSearchHistoryService, IUserSearchHistory } from "../../services/user-search-history/user-search-history.service";
import { AuthService } from "../../services/auth.service";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent, SearchBarComponent, AddToFavoritesComponent, UserProfileDropdownComponent],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input() searchText: string = "";
  @Input() showSearchBar: boolean = true;

  @Output() searchTextChange = new EventEmitter<string>();

  // Player route detection
  isOnPlayerRoute: boolean = false;
  currentSpotifyId: string = "";
  currentEntityType: FavoriteEntityType = FavoriteEntityType.Track;
  currentMetadata: any = {};

  // Authentication state
  isAuthenticated: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router, 
    private activatedRoute: ActivatedRoute,
    private spotifyApiService: SpotifyApiService,
    private http: HttpClient,
    private userSearchHistoryService: UserSearchHistoryService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Initial authentication check
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('Navbar: Initial auth state:', this.isAuthenticated);
    
    // Subscribe to authentication state changes
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        const newAuthState = !!user;
        console.log('Navbar: Auth state changed:', newAuthState, user);
        this.isAuthenticated = newAuthState;
      });

    // Also check localStorage periodically for changes
    setInterval(() => {
      const hasUserData = this.authService.hasUserData();
      if (hasUserData !== this.isAuthenticated) {
        console.log('Navbar: Auth state mismatch detected, refreshing');
        this.authService.refreshAuthState();
      }
    }, 2000);

    // Listen to route changes to detect when we're on a player route
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.checkPlayerRoute();
        // Also refresh auth state on route changes (like after login redirect)
        if (this.authService.hasUserData() && !this.isAuthenticated) {
          console.log('Navbar: Route change detected, refreshing auth state');
          this.authService.refreshAuthState();
        }
      });

    // Initial check
    this.checkPlayerRoute();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkPlayerRoute() {
    const url = this.router.url;
    const playerRouteMatch = url.match(/^\/player\/([^\/]+)\/([^\/]+)/);
    
    if (playerRouteMatch) {
      this.isOnPlayerRoute = true;
      const type = playerRouteMatch[1];
      this.currentSpotifyId = playerRouteMatch[2];
      
      // Map type to FavoriteEntityType
      switch (type) {
        case 'track':
          this.currentEntityType = FavoriteEntityType.Track;
          this.fetchTrackMetadata(this.currentSpotifyId);
          break;
        case 'album':
          this.currentEntityType = FavoriteEntityType.Album;
          this.fetchAlbumMetadata(this.currentSpotifyId);
          break;
        case 'artist':
          this.currentEntityType = FavoriteEntityType.Artist;
          this.fetchArtistMetadata(this.currentSpotifyId);
          break;
        default:
          this.currentEntityType = FavoriteEntityType.Track;
          this.setDefaultMetadata();
      }
    } else {
      this.isOnPlayerRoute = false;
      this.currentSpotifyId = "";
      this.currentMetadata = {};
    }
  }

  private fetchTrackMetadata(trackId: string) {
    this.spotifyApiService.getTrack(trackId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (track) => {
          this.currentMetadata = {
            name: track.name,
            artists: track.artists.map((artist: any) => artist.name).join(', '),
            album: track.album.name,
            duration: track.duration_ms,
            image: track.album.images && track.album.images.length > 0 ? track.album.images[0].url : null
          };
        },
        error: (error) => {
          console.error('Error fetching track metadata:', error);
          this.setDefaultMetadata();
        }
      });
  }

  private fetchAlbumMetadata(albumId: string) {
    this.spotifyApiService.getAlbum(albumId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (album) => {
          this.currentMetadata = {
            name: album.name,
            artists: album.artists.map((artist: any) => artist.name).join(', '),
            album: album.name,
            duration: null,
            image: album.images && album.images.length > 0 ? album.images[0].url : null
          };
        },
        error: (error) => {
          console.error('Error fetching album metadata:', error);
          this.setDefaultMetadata();
        }
      });
  }

  private fetchArtistMetadata(artistId: string) {
    this.spotifyApiService.getArtist(artistId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (artist) => {
          this.currentMetadata = {
            name: artist.name,
            artists: artist.name,
            album: null,
            duration: null,
            image: artist.images && artist.images.length > 0 ? artist.images[0].url : null
          };
        },
        error: (error) => {
          console.error('Error fetching artist metadata:', error);
          this.setDefaultMetadata();
        }
      });
  }

  private setDefaultMetadata() {
    // Fallback metadata when API calls fail
    this.currentMetadata = {
      name: `Current ${this.currentEntityType}`,
      artists: 'Unknown Artist',
      album: this.currentEntityType === FavoriteEntityType.Album ? 'Unknown Album' : 'Unknown Album',
      image: null
    };
  }

  navigateTo(path: string) {
    this.router.navigate([path === 'home' ? '/' : '/' + path]);
  }

  handleSearch(query: string) {
    this.userSearchHistoryService.addSearch(query).subscribe({
      next: (res) => {
        console.log('Search results:', res);
      },
      error: (err) => {
        console.error('Search error:', err);
      }
    });

    this.router.navigate(["/search/" + query]);
  }

  // Called when the search bar emits a change
  onSearchTextChange(newValue: string) {
    this.searchTextChange.emit(newValue);
  }

  // Handle favorite toggle events
  onFavoriteToggled(event: { spotifyId: string; isFavorite: boolean }) {
    console.log('Favorite toggled:', event);
    // Could emit an event or perform additional actions here if needed
  }
}