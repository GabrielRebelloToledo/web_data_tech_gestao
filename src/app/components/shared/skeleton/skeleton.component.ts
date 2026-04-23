import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="skeleton"
         [style.width]="width"
         [style.height]="height"
         [style.borderRadius]="rounded ? '999px' : 'var(--radius-sm)'"></div>
  `,
  styles: [`
    :host { display: inline-block; width: 100%; }
    .skeleton {
      display: block;
      background: linear-gradient(
        90deg,
        var(--color-muted) 0%,
        rgba(226, 232, 240, 0.5) 50%,
        var(--color-muted) 100%
      );
      background-size: 200% 100%;
      animation: skeleton-shine 1.4s ease-in-out infinite;
    }
    @keyframes skeleton-shine {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .skeleton { animation: none; }
    }
  `]
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '16px';
  @Input() rounded: boolean = false;
}
