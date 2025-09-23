// // import { Component, Input, Output, EventEmitter } from "@angular/core";
// // import { FormsModule } from "@angular/forms";
// // import { CommonModule } from "@angular/common";
// // import { InputTextModule } from "primeng/inputtext";
// // import { ButtonModule } from "primeng/button";
// // import { ThemeService } from "../../services/themes/theme.service";

// // @Component({
// //   selector: "app-search-bar",
// //   standalone: true,
// //   imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
// //   templateUrl: "./search-bar.component.html",
// //   styleUrls: ["./search-bar.component.css"],
// // })
// // export class SearchBarComponent {
// //   private _searchTerm = "";

// //   constructor(public themeService: ThemeService) { }

// //   @Input()
// //   get searchTerm(): string {
// //     return this._searchTerm;
// //   }
// //   set searchTerm(val: string) {
// //     this._searchTerm = val;
// //     this.searchTermChange.emit(val);
// //   }

// //   @Output() searchTermChange = new EventEmitter<string>();
// //   @Output() search = new EventEmitter<string>();

// //   onSearch(): void {
// //     this.search.emit(this.searchTerm);
// //   }
// // }

// import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
// import { FormsModule } from "@angular/forms";
// import { CommonModule } from "@angular/common";
// import { InputTextModule } from "primeng/inputtext";
// import { ButtonModule } from "primeng/button";
// import { ThemeService } from "../../services/themes/theme.service";
// import { HttpClient } from "@angular/common/http";

// @Component({
//   selector: "app-search-bar",
//   standalone: true,
//   imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
//   templateUrl: "./search-bar.component.html",
//   styleUrls: ["./search-bar.component.css"],
// })
// export class SearchBarComponent implements OnInit {
//   private _searchTerm = "";
//   showDropdown = false;
//   userSearches: string[] = [];
//   filteredSearches: string[] = [];

//   constructor(public themeService: ThemeService, private http: HttpClient) { }

//   ngOnInit() {
//     const jwt = localStorage.getItem('jwt_token');
//     this.http.get<any[]>(
//       "https://localhost:7244/api/UserSearchHistory",
//       {
//         headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
//         withCredentials: true
//       }
//     ).subscribe({
//       next: (searches) => {
//         // If backend returns array of objects, map to string
//         this.userSearches = Array.isArray(searches)
//           ? searches.map(s => s.query || s)
//           : [];
//         this.filteredSearches = [...this.userSearches];
//         console.log('userSearches:', this.userSearches);
//       },
//       error: () => {
//         this.userSearches = [];
//         this.filteredSearches = [];
//       }
//     });
//   }

//   @Input()
//   get searchTerm(): string {
//     return this._searchTerm;
//   }
//   set searchTerm(val: string) {
//     this._searchTerm = val;
//     this.searchTermChange.emit(val);
//     this.filterSearches();
//   }

//   @Output() searchTermChange = new EventEmitter<string>();
//   @Output() search = new EventEmitter<string>();

//   onSearch(): void {
//     this.search.emit(this.searchTerm);
//     this.showDropdown = false;
//   }

//   filterSearches() {
//     const term = this.searchTerm.toLowerCase();
//     this.filteredSearches = this.userSearches.filter(s => s.toLowerCase().includes(term));
//     this.showDropdown = !!term && this.filteredSearches.length > 0;
//   }

//   hideDropdown() {
//     setTimeout(() => this.showDropdown = false, 200);
//   }

//   selectSearch(search: string) {
//     this.searchTerm = search;
//     this.showDropdown = false;
//     this.onSearch();
//   }
// }

import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { ThemeService } from "../../services/themes/theme.service";
import { HttpClient } from "@angular/common/http";

interface UserSearchHistory {
  id: number;
  query: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Component({
  selector: "app-search-bar",
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.css"],
})
export class SearchBarComponent implements OnInit {
  private _searchTerm = "";
  showDropdown = false;
  userSearches: UserSearchHistory[] = [];
  filteredSearches: UserSearchHistory[] = [];

  constructor(public themeService: ThemeService, private http: HttpClient) { }

  ngOnInit() {
    this.fetchSearchHistory();
  }

  fetchSearchHistory() {
    const jwt = localStorage.getItem('jwt_token');
    this.http.get<UserSearchHistory[]>(
      "https://localhost:7244/api/UserSearchHistory",
      {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        withCredentials: true
      }
    ).subscribe({
      next: (searches) => {
        this.userSearches = Array.isArray(searches) ? searches : [];
        this.filterSearches();
      },
      error: () => {
        this.userSearches = [];
        this.filteredSearches = [];
        this.showDropdown = false;
      }
    });
  }

  @Input()
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(val: string) {
    this._searchTerm = val;
    this.searchTermChange.emit(val);
    this.filterSearches();
  }

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

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
  }

  removeSearch(searchId: number) {
    const jwt = localStorage.getItem('jwt_token');
    this.http.delete(
      `https://localhost:7244/api/UserSearchHistory/${searchId}`,
      {
        headers: jwt ? { Authorization: `Bearer ${jwt}` } : {},
        withCredentials: true
      }
    ).subscribe({
      next: () => {
        this.userSearches = this.userSearches.filter(s => s.id !== searchId);
        this.filterSearches();
      },
      error: (err) => {
        console.error('Failed to remove search:', err);
      }
    });
  }

  hideDropdown() {
    setTimeout(() => this.showDropdown = false, 200);
  }

  selectSearch(search: UserSearchHistory) {
    this.searchTerm = search.query;
    this.showDropdown = false;
    this.onSearch();
  }
} 