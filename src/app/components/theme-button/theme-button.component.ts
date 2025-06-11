import { Component } from '@angular/core';
import { ThemeService } from '../../services/themes/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: "app-theme-button",
  imports: [CommonModule],
  templateUrl: "./theme-button.component.html",
  styleUrl: "./theme-button.component.css",
})
export class ThemeButtonComponent {
  constructor(public themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.setDarkMode(!this.themeService.isDarkMode());
  }

  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}
