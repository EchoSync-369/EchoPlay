import { Component } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Router } from "@angular/router";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { CarouselComponent } from "../../components/carousel/carousel.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [SearchBarComponent, CarouselComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  constructor(private http: HttpClient, private router: Router) {}

  token: string = localStorage.getItem("access_token") || "";
  searchText = "";

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

  handleSearch(query: string) {
    console.log("Searching for:", query);
    this.router.navigate(["/search/" + query]);
  }
}
