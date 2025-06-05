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
  albums: Album[] = [];

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
    const cardWidth = 200 + 16;
    const maxCards = Math.floor(width / cardWidth);
    return Math.max(1, maxCards);
  }

  private onResize() {
    this.numVisible = this.getNumVisible();
  }
}
