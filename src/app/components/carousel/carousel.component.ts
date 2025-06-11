import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule, CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent {
  @Input() data: any[] = [];

  numVisible: number;

  constructor() {
    this.numVisible = this.getNumVisible();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  private getNumVisible() {
    const width = window.innerWidth;
    const cardWidth = 200 + 16;
    const maxCards = Math.floor(width / cardWidth);
    return Math.max(1, maxCards);
  }

  private onResize() {
    this.numVisible = this.getNumVisible();
  }
}
