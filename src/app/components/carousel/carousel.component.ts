import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {
    this.numVisible = this.getNumVisible();
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onCardClick(card: { type: string; id: string } | undefined): void {
    if (card && card.type && card.id) {
      this.router.navigate(['/player', card.type, card.id]);
      console.log("Selected Card", card);
    }
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
