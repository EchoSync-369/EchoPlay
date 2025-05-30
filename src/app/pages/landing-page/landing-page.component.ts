import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../../app/environments/environment";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [],
  templateUrl: "./landing-page.component.html",
  styleUrl: "./landing-page.component.css",
})
export class LandingPageComponent {
  constructor(private http: HttpClient, private router: Router) {}

  login(): void {
    const body = new HttpParams()
      .set("grant_type", "client_credentials")
      .set("client_id", environment.clientId)
      .set("client_secret", environment.clientSecret);

    const headers = new HttpHeaders({
      "Content-Type": "application/x-www-form-urlencoded",
    });

    this.http
      .post<any>("https://accounts.spotify.com/api/token", body, { headers })
      .subscribe({
        next: (response) => {
          localStorage.setItem("access_token", response.access_token);
          this.router.navigate(["/home"]);
        },
        error: (err) => {
          console.error("Login failed:", err);
        },
      });
  }
}
