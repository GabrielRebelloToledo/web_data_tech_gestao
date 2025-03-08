import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
const API = environment.BASE_URL;


@Injectable({
  providedIn: 'root'
})
export class GraphService {

  constructor() { }
}
