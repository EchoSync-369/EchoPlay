import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Song } from '../../models/song';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent {
  songs: Song[] = Array.from({ length: 20 }, (_, i) => ({
    title: `Song Title ${i + 1}`,
    artist: `Artist ${i + 1}`,
  }));

  numVisible: number;

  constructor() {
    this.numVisible = this.getNumVisible();
    window.addEventListener('resize', this.onResize.bind(this));
  }

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
