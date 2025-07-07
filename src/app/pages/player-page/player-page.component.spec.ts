import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PlayerPageComponent } from './player-page.component';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { of } from 'rxjs';
import { ThemeService } from '../../services/themes/theme.service';

describe('PlayerPageComponent', () => {
  let component: PlayerPageComponent;
  let fixture: ComponentFixture<PlayerPageComponent>;
  let sanitizer: DomSanitizer;

  const mockActivatedRoute = {
    paramMap: of({
      get: (key: string) => (key === 'type' ? 'track' : key === 'id' ? '12345' : null),
    }),
  };

  const mockThemeService = {
    initTheme: jest.fn(),
    isDarkMode: jest.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayerPageComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ThemeService, useValue: mockThemeService },
      ],
    }).compileComponents();

    sanitizer = TestBed.inject(DomSanitizer);
    fixture = TestBed.createComponent(PlayerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call initTheme on init', () => {
    expect(mockThemeService.initTheme).toHaveBeenCalled();
  });

  it('should generate valid iframe URLs for both themes', () => {
    const light = component.lightIframeSrc.toString();
    const dark = component.darkIframeSrc.toString();
    expect(light).toContain('theme=1');
    expect(dark).toContain('theme=0');
  });

  it('should show loading on theme toggle', () => {
    component.isLoading = false;
    component.onThemeToggle();
    expect(component.isLoading).toBe(true);
  });
});
