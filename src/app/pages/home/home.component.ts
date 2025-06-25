import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { CarouselComponent } from "../../components/carousel/carousel.component";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";
import { Album } from "../../models/album";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CarouselComponent, ButtonModule],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent implements OnInit {
  searchText = "";
  newReleases: Album[] = [];

  constructor(private spotifyApi: SpotifyApiService, private router: Router) {
  }

  ngOnInit() {
    this.spotifyApi.getNewReleases((albums: Album[]) => {
      this.newReleases = albums;
    });
  }

  handleSearch(query: string) {
    console.log("Searching for:", query);
    this.router.navigate(["/search/" + query]);
  }

  openSpotify() {
    window.open('https://open.spotify.com/', '_blank');
  }
}
