import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ThemeService } from './services/themes/theme.service';

// Mock ThemeService
class MockThemeService {
  initTheme = jest.fn();
}

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: ThemeService, useClass: MockThemeService }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call themeService.initTheme on ngOnInit', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const themeService = TestBed.inject(ThemeService);
    app.ngOnInit();
    expect(themeService.initTheme).toHaveBeenCalled();
  });
});