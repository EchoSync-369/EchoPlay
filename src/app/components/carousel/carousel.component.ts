import { Component, OnInit } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Album } from '../../models/album';
import { SpotifyApiService } from '../../services/spotify-api/spotify-api.service';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent implements OnInit {
  albums: Album[] = Array.from({ length: 20 }, (_, i) => ({
    name: `Album ${i + 1}`,
    artist: `Artist ${i + 1}`,
  }));

  constructor(private spotifyApiService: SpotifyApiService) {
    this.numVisible = this.getNumVisible();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  ngOnInit() {
    this.spotifyApiService.getNewReleases((albums: Album[]) => {
      this.albums = albums;
    });
  }

  numVisible: number;

  private getNumVisible(): number {
    const width = window.innerWidth;
    if (width >= 1200) return 6;
    if (width >= 992) return 5;
    if (width >= 768) return 4;
    if (width >= 576) return 3;
    return 1;
  }

  private onResize() {
    this.numVisible = this.getNumVisible();
  }
}
