import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Album } from "../../models/album";

@Injectable({
  providedIn: "root",
})
export class SpotifyApiService {
  constructor(private http: HttpClient) {}

  token: string = localStorage.getItem("access_token") || "";
  headers = new HttpHeaders({
    Authorization: `Bearer ${this.token}`,
  });

  getNewReleases(p0: (albums: Album[]) => void) {
    return this.http
      .get<any>("https://api.spotify.com/v1/browse/new-releases", {
        headers: this.headers,
      })
      .subscribe({
        next: (response) => {
          console.log("Response received:", response);
          // Call the callback with the albums array if available
          if (response && response.albums && response.albums.items) {
            p0(response.albums.items as Album[]);
          } else {
            p0([]);
          }
        },
        error: (err) => {
          console.error("Oopsies tehe:", err);
          p0([]);
        },
      });
  }

  search(query: string, p0: (results: any) => void) {
    const params = new HttpParams()
      .set("q", query)
      .set("type", "album,artist,track,playlist");

    return this.http
      .get<any>("https://api.spotify.com/v1/search", {
        headers: this.headers,
        params: params,
      })
      .subscribe({
        next: (response) => {
          console.log("Search response received:", response);
          p0(response);
        },
        error: (err) => {
          console.error("Search error:", err);
          p0(null);
        },
      });
  }
}
