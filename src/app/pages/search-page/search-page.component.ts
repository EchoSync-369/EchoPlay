import { Component, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";
import { CarouselComponent } from "../../components/carousel/carousel.component";
import { Subscription } from "rxjs";

@Component({
  selector: "app-search-page",
  imports: [CarouselComponent],
  templateUrl: "./search-page.component.html",
  styleUrl: "./search-page.component.css",
})
export class SearchPageComponent implements OnDestroy {
  @Input() albums: any[] = [];
  @Input() artists: any[] = [];
  @Input() playlists: any[] = [];
  @Input() tracks: any[] = [];

  private routeSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private spotifyApiService: SpotifyApiService
  ) {
    this.routeSub = this.route.paramMap.subscribe((params) => {
      const query = params.get("query") || "";
      this.query = query;
      this.searchSpotify(query);
    });
  }

  query: string = "";

  private searchSpotify(query: string) {
    this.spotifyApiService.search(query, (results: any) => {
      // Debug: log the results to verify structure
      console.log("Spotify search results:", results);

      this.albums = results?.albums?.items?.length
        ? results.albums.items.filter(Boolean).map((album: any) => ({
            id: album?.id ?? "",
            name: album?.name ?? "",
            artists: album?.artists?.map((artist: any) => artist?.name ?? "").join(", ") || "",
            images: album?.images ?? [],
          }))
        : [];
      
      this.artists = results?.artists?.items?.length
        ? results.artists.items.filter(Boolean).map((artist: any) => ({
            id: artist?.id ?? "",
            name: artist?.name ?? "",
            images: artist?.images ?? [],
          }))
        : [];

      this.playlists = results?.playlists?.items?.length
        ? results.playlists.items.filter(Boolean).map((playlist: any) => ({
            id: playlist?.id ?? "",
            name: playlist?.name ?? "",
            images: playlist?.images ?? [],
          }))
        : [];

      this.tracks = results?.tracks?.items?.length
        ? results.tracks.items.filter(Boolean).map((track: any) => ({
            id: track?.id ?? "",
            name: track?.name ?? "",
            artists: track?.artists?.map((artist: any) => artist?.name ?? "").join(", ") || "",
            album: track?.album?.name ?? "",
            images: track?.album?.images ?? [],
          }))
        : [];
    });
  }

  ngOnDestroy() {
    this.routeSub.unsubscribe();
  }
}
