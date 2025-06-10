import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

@Component({
  selector: "app-player-page",
  templateUrl: "./player-page.component.html",
  styleUrls: ["./player-page.component.css"],
})
export class PlayerPageComponent {
  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  iframeSrc: SafeResourceUrl = "";

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const type = params.get("type");
      const id = params.get("id");

      if (type && id) {
        const url = `https://open.spotify.com/embed/${type}/${id}?utm_source=generator`;
        this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }
    });
  }
}
