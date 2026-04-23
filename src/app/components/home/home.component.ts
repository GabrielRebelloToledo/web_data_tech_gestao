import { Component } from '@angular/core';
import { ShellComponent } from '../shell/shell.component';
import { CalledsComponent } from '../calleds/calleds.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ShellComponent, CalledsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {}
