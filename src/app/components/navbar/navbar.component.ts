import { Component, Input, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { ThemeButtonComponent } from "../theme-button/theme-button.component";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-navbar",
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent, SearchBarComponent],
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.css"],
})
export class NavbarComponent {
  @Input() searchText: string = "";
  @Output() searchTextChange = new EventEmitter<string>();
  @Input() showSearchBar: boolean = true;

  constructor(private router: Router) {}

  navigateTo(path: string) {
    this.router.navigate([path === 'home' ? '/' : '/' + path]);
  }

  handleSearch(query: string) {
    this.router.navigate(["/search/" + query]);
  }

  // Called when the search bar emits a change
  onSearchTextChange(newValue: string) {
    this.searchTextChange.emit(newValue);
  }
}