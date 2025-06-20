import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule, CommonModule],
  templateUrl: './carousel.component.html',
  styleUrl: './carousel.component.css'
})

export class CarouselComponent implements OnDestroy {
  @Input() data: any[] = [];

  numVisible: number;
  responsiveOptions: any[];

  constructor(private router: Router) {
    this.numVisible = this.getNumVisible(); this.responsiveOptions = [
      {
        breakpoint: '1200px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '900px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '600px',
        numVisible: 1,
        numScroll: 1
      }
    ];
    window.addEventListener('resize', this.onResize.bind(this));
  }

  onCardClick(card: { type: string; id: string } | undefined): void {
    if (card && card.type && card.id) {
      this.router.navigate(['/player', card.type, card.id]);
      console.log("Selected Card", card);
    }
  } private getNumVisible() {
    const width = window.innerWidth;

    // Calculate based on new wider card width (260px) + margins (16px) + some padding
    const cardWidth = 260 + 16;
    const availableWidth = width - 120; // Reserve space for navigation buttons
    const maxCards = Math.floor(availableWidth / cardWidth);

    // Responsive breakpoints as fallback with updated values for wider cards
    if (width < 600) {
      return Math.min(1, maxCards);
    } else if (width < 900) {
      return Math.min(2, maxCards);
    } else if (width < 1200) {
      return Math.min(3, maxCards);
    } else if (width < 1600) {
      return Math.min(4, maxCards);
    } else if (width < 2000) {
      return Math.min(5, maxCards);
    } else {
      return Math.min(6, maxCards);
    }
  }

  private onResize() {
    this.numVisible = this.getNumVisible();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}
