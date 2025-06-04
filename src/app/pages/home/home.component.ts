import { Component } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  constructor(private http: HttpClient) {}

  token: string = localStorage.getItem("access_token") || "";

  ngOnInit() {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
    });

    this.http
      .get<any>("https://api.spotify.com/v1/browse/categories", { headers })
      .subscribe({
        next: (response) => {
          console.log("Response received:", response);
        },
        error: (err) => {
          console.error("Oopsies tehe:", err);
        },
      });
  }
}
