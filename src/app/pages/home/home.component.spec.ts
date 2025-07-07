import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { HomeComponent } from './home.component';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';
import { Router } from '@angular/router';

// Mock SpotifyApiService
class MockSpotifyApiService {
  getNewReleases(cb: any) {
    cb([{ id: '1', name: 'Test Album' }]);
  }
}

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: any;
  let router: Router;

  beforeEach(async () => {
    const routerMock = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, HttpClientTestingModule],
      providers: [
        { provide: SpotifyApiService, useClass: MockSpotifyApiService },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load new releases on init', () => {
    expect(component.newReleases.length).toBeGreaterThan(0);
    expect(component.newReleases[0].name).toBe('Test Album');
  });

  it('should navigate to search page on handleSearch', () => {
    component.handleSearch('test');
    expect(router.navigate).toHaveBeenCalledWith(['/search/test']);
  });

  it('should open Spotify web player in a new tab', () => {
    window.open = jest.fn();
    component.openSpotify();
    expect(window.open).toHaveBeenCalledWith('https://open.spotify.com/', '_blank');
  });
});