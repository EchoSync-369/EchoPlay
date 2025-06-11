import { Component } from '@angular/core';
import { RouterOutlet } from "@angular/router";
import { ThemeService } from "./services/themes/theme.service";
import { ThemeButtonComponent } from './components/theme-button/theme-button.component';

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, ThemeButtonComponent],
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  constructor(private themeService: ThemeService) {}

  ngOnInit() {
    this.themeService.initTheme();
  }
}
