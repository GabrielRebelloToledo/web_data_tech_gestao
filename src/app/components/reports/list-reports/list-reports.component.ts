import { Component } from '@angular/core';
import { ShellComponent } from '../../shell/shell.component';

@Component({
  selector: 'app-list-reports',
  standalone: true,
  imports: [ShellComponent],
  templateUrl: './list-reports.component.html',
  styleUrl: './list-reports.component.css'
})
export class ListReportsComponent {}
