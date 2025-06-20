import { Component } from "@angular/core";
import { Router, RouterOutlet, ActivatedRoute } from "@angular/router";
import { ThemeService } from "./services/themes/theme.service";
import { ThemeButtonComponent } from "./components/theme-button/theme-button.component";
import { SearchBarComponent } from "./components/search-bar/search-bar.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    ThemeButtonComponent,
    SearchBarComponent,
  ],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  searchText = "";
  showSearchBar = true;

  constructor(
    private themeService: ThemeService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.router.events.subscribe(() => {
      // Find the deepest activated route
      let current = this.route.root;
      while (current.firstChild) {
        current = current.firstChild;
      }
      this.showSearchBar = current.snapshot.data["showSearchBar"] !== false;
    });
  }

  ngOnInit() {
    this.themeService.initTheme();
  }

  navigateTo(path: string) {
    this.router.navigate([path === 'home' ? '/' : '/' + path]);
  }

  handleSearch(query: string) {
    this.router.navigate(["/search/" + query]);
  }
}
