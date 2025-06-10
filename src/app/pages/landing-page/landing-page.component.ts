import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../app/environments/environment";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [],
  templateUrl: "./landing-page.component.html",
  styleUrl: "./landing-page.component.css",
})
export class LandingPageComponent {
  constructor(
    private router: Router,
    private spotifyApiService: SpotifyApiService
  ) {}

  login(): void {
    this.spotifyApiService.getAccessToken((success) => {
      if (success) {
        this.router.navigate(["/home"]);
      } else {
        console.error("Login failed.");
      }
    });
  }
}
