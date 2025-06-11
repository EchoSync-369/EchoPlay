import { Component, Input } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import { SearchBarComponent } from "../../components/search-bar/search-bar.component";
import { SpotifyApiService } from "../../services/spotify-api/spotify-api.service";
import { CarouselComponent } from "../../components/carousel/carousel.component";

@Component({
  selector: "app-search-page",
  imports: [CarouselComponent],
  templateUrl: "./search-page.component.html",
  styleUrl: "./search-page.component.css",
})
export class SearchPageComponent {
  @Input() albums: any[] = [];
  @Input() artists: any[] = [];
  @Input() playlists: any[] = [];
  @Input() tracks: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private spotifyApiService: SpotifyApiService
  ) { }

  token: string = localStorage.getItem("access_token") || "";
  query!: string;

  ngOnInit() {
    this.query = this.route.snapshot.paramMap.get("query") || "";

    this.spotifyApiService.search(this.query, (results: any) => {
      // Debug: log the results to verify structure
      console.log('Spotify search results:', results);

      this.albums = results.albums?.items
        ? results.albums.items.filter(Boolean).map((album: any) => ({
            id: album.id,
            name: album.name,
            artists: album.artists?.map((artist: any) => artist.name).join(", ") || "",
            images: album.images || [],
          }))
        : [];
      
      this.artists = results.artists?.items
        ? results.artists.items.filter(Boolean).map((artist: any) => ({
            id: artist.id,
            name: artist.name,
            images: artist.images || [],
          }))
        : [];

      this.playlists = results.playlists && results.playlists.items
        ? results.playlists.items.filter(Boolean).map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            images: playlist.images || [],
          }))
        : [];

      this.tracks = results.tracks && results.tracks.items
        ? results.tracks.items.filter(Boolean).map((track: any) => ({
            id: track.id,
            name: track.name,
            artists: track.artists?.map((artist: any) => artist.name).join(", ") || "",
            album: track.album?.name || "",
            images: track.album?.images || [],
          }))
        : [];
    });
  }
}
