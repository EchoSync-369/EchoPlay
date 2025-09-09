import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";
import { ButtonModule } from 'primeng/button';
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [ButtonModule],
  templateUrl: "./landing-page.component.html",
  styleUrl: "./landing-page.component.css",
})
export class LandingPageComponent {
  constructor(
    private router: Router,
    private spotifyApiService: SpotifyApiService,
    private httpClient: HttpClient,
  ) {}

  login(): void {
    // this.spotifyApiService.getAccessToken((success) => {
    //   if (success) {
    //     this.router.navigate(["/home"]);
    //   } else {
    //     console.error("Login failed.");
    //   }
    // });
    this.httpClient.get("https://192.168.1.111:7244/auth/spotify", { withCredentials: true })
  .subscribe(response => {
    // handle response
    console.log(response)
  });
  }
}
