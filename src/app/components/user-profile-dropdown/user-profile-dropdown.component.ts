import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Subject, takeUntil } from 'rxjs';

interface SpotifyUser {
  display_name: string;
  email: string;
  images: Array<{
    height: number;
    url: string;
    width: number;
  }>;
  id: string;
  country: string;
}

@Component({
  selector: 'app-user-profile-dropdown',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile-dropdown.component.html',
  styleUrls: ['./user-profile-dropdown.component.css']
})
export class UserProfileDropdownComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: SpotifyUser | null = null;
  isDropdownOpen = false;
  userImage: string | null = null;

  constructor(
    private authService: AuthService,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Subscribe to user changes from auth service
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.user = user;
        this.updateUserImage();
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateUserImage() {
    if (this.user?.images && this.user.images.length > 0) {
      // Use the larger image if available, otherwise fall back to smaller one
      const largeImage = this.user.images.find(img => img.width >= 200);
      this.userImage = largeImage?.url || this.user.images[0]?.url || null;
    } else {
      this.userImage = null;
    }
  }

  toggleDropdown() {
    console.log('Toggle dropdown clicked, current state:', this.isDropdownOpen);
    this.isDropdownOpen = !this.isDropdownOpen;
    console.log('New dropdown state:', this.isDropdownOpen);
  }

  logout() {
    // Try to logout via backend, fallback to local logout if it fails
    this.authService.logout().subscribe({
      next: () => {
        console.log('Logout successful');
      },
      error: (error) => {
        console.error('Backend logout failed, using local logout:', error);
        this.authService.logoutLocal();
      }
    });
    
    // Close dropdown
    this.isDropdownOpen = false;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen = false;
    }
  }

  // Prevent dropdown from closing when clicking inside it
  onDropdownClick(event: Event) {
    event.stopPropagation();
  }

  getInitials(): string {
    if (!this.user?.display_name) return 'U';
    
    const names = this.user.display_name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[names.length - 1][0];
    }
    return names[0][0] || 'U';
  }
}