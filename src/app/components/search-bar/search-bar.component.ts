import { Component, Input, Output, EventEmitter } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { InputTextModule } from "primeng/inputtext";
import { ButtonModule } from "primeng/button";
import { ThemeService } from "../../services/themes/theme.service";

@Component({
  selector: "app-search-bar",
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule],
  templateUrl: "./search-bar.component.html",
  styleUrls: ["./search-bar.component.css"],
})
export class SearchBarComponent {
  private _searchTerm = "";

  constructor(public themeService: ThemeService) { }

  @Input()
  get searchTerm(): string {
    return this._searchTerm;
  }
  set searchTerm(val: string) {
    this._searchTerm = val;
    this.searchTermChange.emit(val);
  }

  @Output() searchTermChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  onSearch(): void {
    this.search.emit(this.searchTerm);
  }
}
