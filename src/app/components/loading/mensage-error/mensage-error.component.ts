import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mensage-error',
  standalone: true,
  imports: [],
  templateUrl: './mensage-error.component.html',
  styleUrl: './mensage-error.component.css'
})
export class MensageErrorComponent {
  @Input() mensagem: string = '';
}
