import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { ThemeService } from "../../services/themes/theme.service";
import { UserSearchHistoryService, IUserSearchHistory } from "../../services/user-search-history/user-search-history.service";

@Component({
  selector: "app-search-bar",
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.css"],
})
export class SearchBarComponent implements OnInit {
  @Input() searchTerm: string = "";
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  showDropdown = false;
  userSearches: IUserSearchHistory[] = [];
  filteredSearches: IUserSearchHistory[] = [];

  constructor(
    public themeService: ThemeService,
    private userSearchHistoryService: UserSearchHistoryService
  ) {}

  ngOnInit() {
    this.fetchSearchHistory();
  }

  fetchSearchHistory() {
    this.userSearchHistoryService.getSearchHistory().subscribe({
      next: (searches: IUserSearchHistory[]) => {
        this.userSearches = Array.isArray(searches) ? searches : [];
        this.filterSearches();
      },
      error: (err: any) => {
        this.userSearches = [];
        this.filteredSearches = [];
        this.showDropdown = false;
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm.trim();
    if (term) {
      this.search.emit(term);
      this.showDropdown = false;
      setTimeout(() => this.fetchSearchHistory(), 300); // Give backend time to save
    }
  }

  filterSearches() {
    const term = this.searchTerm.toLowerCase();
    this.filteredSearches = !term
      ? [...this.userSearches]
      : this.userSearches.filter(s => s.query.toLowerCase().includes(term));
    // Show dropdown if input is focused and there are results
    if (document.activeElement === document.querySelector('input[ngModel]') && this.filteredSearches.length > 0) {
      this.showDropdown = true;
    }
  }

  removeSearch(searchId: number) {
    this.userSearchHistoryService.deleteSearch(searchId).subscribe({
      next: () => {
        this.userSearches = this.userSearches.filter(s => s.id !== searchId);
        this.filterSearches();
      },
      error: (err: any) => {
        console.error('Failed to remove search:', err);
      }
    });
  }

  hideDropdown() {
    setTimeout(() => this.showDropdown = false, 200);
  }

  selectSearch(search: IUserSearchHistory) {
    this.searchTerm = search.query;
    this.showDropdown = false;
    this.onSearch();
  }
}