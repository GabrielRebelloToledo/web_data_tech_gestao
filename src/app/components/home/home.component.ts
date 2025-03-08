import { Component } from '@angular/core';
import { HeadComponent } from '../head/head.component';
import { CalledsComponent } from "../calleds/calleds.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeadComponent, CalledsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

}
