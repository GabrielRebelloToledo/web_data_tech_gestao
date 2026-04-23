import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';


@Component({
  selector: 'app-forms-details',
  standalone: true,
  imports: [MatTabsModule, CommonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule],
  templateUrl: './forms-details.component.html',
  styleUrl: './forms-details.component.css'
})
export class FormsDetailsComponent {

}
