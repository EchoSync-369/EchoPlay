import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private darkModeKey = "dark_mode";

  isDarkMode(): boolean {
    const stored = localStorage.getItem(this.darkModeKey);
    if (stored === null) {
      // Default to dark mode if no preference is saved
      return true;
    }
    return stored === "true";
  }

  setDarkMode(enabled: boolean) {
    localStorage.setItem(this.darkModeKey, String(enabled));
    if (enabled) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }

  initTheme() {
    this.setDarkMode(this.isDarkMode());
  }
}
