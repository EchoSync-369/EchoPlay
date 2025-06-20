import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { CommonModule } from "@angular/common";
import { ThemeService } from "../../services/themes/theme.service";

@Component({
  selector: "app-player-page",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./player-page.component.html",
  styleUrls: ["./player-page.component.css"],
})

export class PlayerPageComponent {
  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    public themeService: ThemeService
  ) { }

  lightIframeSrc: SafeResourceUrl = "";
  darkIframeSrc: SafeResourceUrl = "";
  private currentType: string = "";
  private currentId: string = "";
  private lastThemeState: boolean = false;
  isLoading: boolean = true;

  get isDarkMode(): boolean {
    const currentTheme = this.themeService.isDarkMode();

    if (currentTheme !== this.lastThemeState && this.currentType && this.currentId) {
      this.lastThemeState = currentTheme;
      this.isLoading = true;
      setTimeout(() => {
        this.isLoading = false;
      }, 300);
    }
    return currentTheme;
  } ngOnInit() {
    this.themeService.initTheme();
    this.lastThemeState = this.themeService.isDarkMode();

    this.route.paramMap.subscribe((params) => {
      const type = params.get("type");
      const id = params.get("id");

      if (type && id) {
        this.currentType = type;
        this.currentId = id;
        this.preloadBothThemes();
      }
    });
  }

  private preloadBothThemes() {
    if (this.currentType && this.currentId) {
      const lightUrl = `https://open.spotify.com/embed/${this.currentType}/${this.currentId}?utm_source=generator&theme=1`;
      const darkUrl = `https://open.spotify.com/embed/${this.currentType}/${this.currentId}?utm_source=generator&theme=0`;

      this.lightIframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(lightUrl);
      this.darkIframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(darkUrl);

      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  onThemeToggle() {
    this.isLoading = true;
    setTimeout(() => {
      this.isLoading = false;
    }, 200);
  }
}
