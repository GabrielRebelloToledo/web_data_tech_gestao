import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { NodeComponent } from "../node/node.component";

@Component({
  selector: 'app-process',
  standalone: true,
  imports: [CommonModule, NodeComponent],
  templateUrl: './process.component.html',
  styleUrl: './process.component.css'
})
export class ProcessComponent {
  @Input() processId: String | any;
  @Input() dataPast?: String ;
  @Input() dataEnv?: String;
  @Input() nodes: any[] | any;

  constructor() {}
}
