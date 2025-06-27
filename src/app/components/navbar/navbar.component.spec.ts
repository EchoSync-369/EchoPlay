import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NavbarComponent } from './navbar.component';
import { ThemeButtonComponent } from '../theme-button/theme-button.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { ThemeService } from '../../services/themes/theme.service';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockRouter: jest.Mocked<Router>;
  let mockThemeService: jest.Mocked<ThemeService>;

  beforeEach(async () => {
    // Create mocks for dependencies
    mockRouter = {
      navigate: jest.fn()
    } as any;

    mockThemeService = {
      isDarkMode: jest.fn().mockReturnValue(false),
      setDarkMode: jest.fn(),
      initTheme: jest.fn()
    } as any;

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ThemeService, useValue: mockThemeService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.searchText).toBe('');
      expect(component.showSearchBar).toBe(true);
    });

    it('should render navbar with correct structure', () => {
      fixture.detectChanges();
      
      const navbarElement = fixture.debugElement.query(By.css('.navbar'));
      expect(navbarElement).toBeTruthy();
      
      const leftSection = fixture.debugElement.query(By.css('.left'));
      const centerSection = fixture.debugElement.query(By.css('.center'));
      const rightSection = fixture.debugElement.query(By.css('.right'));
      
      expect(leftSection).toBeTruthy();
      expect(centerSection).toBeTruthy();
      expect(rightSection).toBeTruthy();
    });

    it('should render home button with correct icon', () => {
      fixture.detectChanges();
      
      const homeButton = fixture.debugElement.query(By.css('button[title="Home"]'));
      expect(homeButton).toBeTruthy();
      
      const homeIcon = fixture.debugElement.query(By.css('.pi-home'));
      expect(homeIcon).toBeTruthy();
    });

    it('should render theme button component', () => {
      fixture.detectChanges();
      
      const themeButtonComponent = fixture.debugElement.query(By.directive(ThemeButtonComponent));
      expect(themeButtonComponent).toBeTruthy();
    });
  });

  describe('Search Bar Visibility', () => {
    it('should show search bar when showSearchBar is true', () => {
      component.showSearchBar = true;
      fixture.detectChanges();
      
      const searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeTruthy();
      
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      expect(searchBarComponent).toBeTruthy();
    });

    it('should hide search bar when showSearchBar is false', () => {
      component.showSearchBar = false;
      fixture.detectChanges();
      
      const searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeFalsy();
      
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      expect(searchBarComponent).toBeFalsy();
    });

    it('should toggle search bar visibility based on input property', () => {
      // Initially visible
      component.showSearchBar = true;
      fixture.detectChanges();
      let searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeTruthy();
      
      // Hide search bar
      component.showSearchBar = false;
      fixture.detectChanges();
      searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeFalsy();
      
      // Show again
      component.showSearchBar = true;
      fixture.detectChanges();
      searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeTruthy();
    });
  });

  describe('Navigation Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should navigate to home when navigateTo is called with "home"', () => {
      component.navigateTo('home');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should navigate to specified path when navigateTo is called with other paths', () => {
      component.navigateTo('about');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/about']);
      
      component.navigateTo('profile');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
      
      component.navigateTo('settings');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/settings']);
    });

    it('should navigate to home when home button is clicked', () => {
      const homeButton = fixture.debugElement.query(By.css('button[title="Home"]'));
      
      homeButton.nativeElement.click();
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle navigation with empty string', () => {
      component.navigateTo('');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle navigation with special characters', () => {
      component.navigateTo('user-profile');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/user-profile']);
    });
  });

  describe('Search Functionality', () => {
    beforeEach(() => {
      component.showSearchBar = true;
      fixture.detectChanges();
    });

    it('should handle search when handleSearch is called', () => {
      const searchQuery = 'test search query';
      
      component.handleSearch(searchQuery);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/test search query']);
    });

    it('should navigate to search page with encoded query', () => {
      const searchQuery = 'artist name with spaces';
      
      component.handleSearch(searchQuery);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/artist name with spaces']);
    });

    it('should handle empty search query', () => {
      component.handleSearch('');
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/']);
    });

    it('should handle search with special characters', () => {
      const searchQuery = 'search@#$%^&*()';
      
      component.handleSearch(searchQuery);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/search@#$%^&*()']);
    });

    it('should trigger search when search bar component emits search event', () => {
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      const searchBarInstance = searchBarComponent.componentInstance;
      const searchQuery = 'emitted search';
      
      searchBarInstance.search.emit(searchQuery);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/emitted search']);
    });
  });

  describe('Search Text Management', () => {
    beforeEach(() => {
      component.showSearchBar = true;
      fixture.detectChanges();
    });

    it('should emit searchTextChange when onSearchTextChange is called', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      const newSearchText = 'new search text';
      
      component.onSearchTextChange(newSearchText);
      
      expect(searchTextChangeSpy).toHaveBeenCalledWith(newSearchText);
    });

    it('should pass searchText input to search bar component', () => {
      const testSearchText = 'test search input';
      component.searchText = testSearchText;
      fixture.detectChanges();
      
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      const searchBarInstance = searchBarComponent.componentInstance;
      
      expect(searchBarInstance.searchTerm).toBe(testSearchText);
    });

    it('should update search text when search bar emits searchTermChange', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      const searchBarInstance = searchBarComponent.componentInstance;
      const newSearchTerm = 'updated search term';
      
      searchBarInstance.searchTermChange.emit(newSearchTerm);
      
      expect(searchTextChangeSpy).toHaveBeenCalledWith(newSearchTerm);
    });

    it('should handle empty search text changes', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      
      component.onSearchTextChange('');
      
      expect(searchTextChangeSpy).toHaveBeenCalledWith('');
    });

    it('should handle null or undefined search text changes gracefully', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      
      component.onSearchTextChange(null as any);
      expect(searchTextChangeSpy).toHaveBeenCalledWith(null);
      
      component.onSearchTextChange(undefined as any);
      expect(searchTextChangeSpy).toHaveBeenCalledWith(undefined);
    });
  });

  describe('Input Properties', () => {
    it('should accept searchText input', () => {
      const testSearchText = 'input search text';
      component.searchText = testSearchText;
      
      expect(component.searchText).toBe(testSearchText);
    });

    it('should accept showSearchBar input', () => {
      component.showSearchBar = false;
      expect(component.showSearchBar).toBe(false);
      
      component.showSearchBar = true;
      expect(component.showSearchBar).toBe(true);
    });

    it('should update template when input properties change', () => {
      component.showSearchBar = false;
      component.searchText = 'test';
      fixture.detectChanges();
      
      let searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeFalsy();
      
      component.showSearchBar = true;
      fixture.detectChanges();
      
      searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeTruthy();
      
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      expect(searchBarComponent.componentInstance.searchTerm).toBe('test');
    });
  });

  describe('Output Events', () => {
    it('should emit searchTextChange event', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      const testValue = 'test output';
      
      component.onSearchTextChange(testValue);
      
      expect(searchTextChangeSpy).toHaveBeenCalledWith(testValue);
      expect(searchTextChangeSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit searchTextChange with correct value multiple times', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      
      component.onSearchTextChange('first');
      component.onSearchTextChange('second');
      component.onSearchTextChange('third');
      
      expect(searchTextChangeSpy).toHaveBeenCalledTimes(3);
      expect(searchTextChangeSpy).toHaveBeenNthCalledWith(1, 'first');
      expect(searchTextChangeSpy).toHaveBeenNthCalledWith(2, 'second');
      expect(searchTextChangeSpy).toHaveBeenNthCalledWith(3, 'third');
    });
  });

  describe('Component Integration', () => {
    beforeEach(() => {
      component.showSearchBar = true;
      fixture.detectChanges();
    });

    it('should integrate with ThemeButtonComponent', () => {
      const themeButtonComponent = fixture.debugElement.query(By.directive(ThemeButtonComponent));
      
      expect(themeButtonComponent).toBeTruthy();
      expect(themeButtonComponent.componentInstance).toBeInstanceOf(ThemeButtonComponent);
    });

    it('should integrate with SearchBarComponent', () => {
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      
      expect(searchBarComponent).toBeTruthy();
      expect(searchBarComponent.componentInstance).toBeInstanceOf(SearchBarComponent);
    });

    it('should pass correct props to SearchBarComponent', () => {
      const testSearchText = 'integration test';
      component.searchText = testSearchText;
      fixture.detectChanges();
      
      const searchBarComponent = fixture.debugElement.query(By.directive(SearchBarComponent));
      const searchBarInstance = searchBarComponent.componentInstance;
      
      expect(searchBarInstance.searchTerm).toBe(testSearchText);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle Router navigation errors gracefully', () => {
      mockRouter.navigate.mockImplementation(() => {
        throw new Error('Navigation error');
      });
      
      expect(() => component.navigateTo('home')).toThrow('Navigation error');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should handle very long search queries', () => {
      const longQuery = 'a'.repeat(1000);
      
      component.handleSearch(longQuery);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/' + longQuery]);
    });

    it('should handle rapid successive navigation calls', () => {
      component.navigateTo('home');
      component.navigateTo('about');
      component.navigateTo('profile');
      
      expect(mockRouter.navigate).toHaveBeenCalledTimes(3);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(1, ['/']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(2, ['/about']);
      expect(mockRouter.navigate).toHaveBeenNthCalledWith(3, ['/profile']);
    });

    it('should handle rapid search text changes', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      
      component.onSearchTextChange('a');
      component.onSearchTextChange('ab');
      component.onSearchTextChange('abc');
      
      expect(searchTextChangeSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have proper button titles for accessibility', () => {
      const homeButton = fixture.debugElement.query(By.css('button[title="Home"]'));
      
      expect(homeButton.nativeElement.getAttribute('title')).toBe('Home');
    });

    it('should have proper ARIA labels or roles if implemented', () => {
      // This test would be expanded based on actual accessibility implementation
      const navbarElement = fixture.debugElement.query(By.css('.navbar'));
      
      expect(navbarElement).toBeTruthy();
      // Add more specific accessibility checks as needed
    });
  });

  describe('Integration Tests', () => {
    it('should work end-to-end with user interactions', () => {
      const searchTextChangeSpy = jest.spyOn(component.searchTextChange, 'emit');
      
      // Set up component
      component.showSearchBar = true;
      component.searchText = 'initial search';
      fixture.detectChanges();
      
      // Verify initial state
      expect(component.showSearchBar).toBe(true);
      expect(component.searchText).toBe('initial search');
      
      // Simulate home button click
      const homeButton = fixture.debugElement.query(By.css('button[title="Home"]'));
      homeButton.nativeElement.click();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
      
      // Simulate search text change
      component.onSearchTextChange('new search text');
      expect(searchTextChangeSpy).toHaveBeenCalledWith('new search text');
      
      // Simulate search
      component.handleSearch('search query');
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/search/search query']);
      
      // Toggle search bar visibility
      component.showSearchBar = false;
      fixture.detectChanges();
      const searchWrapper = fixture.debugElement.query(By.css('.search-wrapper'));
      expect(searchWrapper).toBeFalsy();
    });
  });
});
