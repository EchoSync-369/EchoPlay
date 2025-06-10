import { Component } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";

@Component({
  selector: "app-search-page",
  imports: [],
  templateUrl: "./search-page.component.html",
  styleUrl: "./search-page.component.css",
})
export class SearchPageComponent {
  constructor(
    private route: ActivatedRoute,
    private spotifyApiService: SpotifyApiService
  ) {}

  token: string = localStorage.getItem("access_token") || "";
  query!: string;

  ngOnInit() {
    this.query = this.route.snapshot.paramMap.get("query") || "";

    this.spotifyApiService.search(this.query, (results: any) => {
      console.log("Search results:", results);
    });
  }
}
