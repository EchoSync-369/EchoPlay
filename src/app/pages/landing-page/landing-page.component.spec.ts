import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { Router } from '@angular/router';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let router: jest.Mocked<Router>;
  let spotifyApiService: jest.Mocked<SpotifyApiService>;

  beforeEach(async () => {
    // Create mocks
    router = {
      navigate: jest.fn()
    } as unknown as jest.Mocked<Router>;

    spotifyApiService = {
      getAccessToken: jest.fn()
    } as unknown as jest.Mocked<SpotifyApiService>;

    await TestBed.configureTestingModule({
      imports: [LandingPageComponent],
      providers: [
        { provide: Router, useValue: router },
        { provide: SpotifyApiService, useValue: spotifyApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to /home if login is successful', () => {
    // Simulate successful login
    spotifyApiService.getAccessToken.mockImplementation((callback: (success: boolean) => void) => {
      callback(true);
    });

    component.login();

    expect(spotifyApiService.getAccessToken).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('should not navigate and log error if login fails', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Simulate failed login
    spotifyApiService.getAccessToken.mockImplementation((callback: (success: boolean) => void) => {
      callback(false);
    });

    component.login();

    expect(spotifyApiService.getAccessToken).toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed.');

    consoleErrorSpy.mockRestore(); // Clean up
  });
});
