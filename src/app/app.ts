import { Component } from '@angular/core';

import { MarkersPage } from './markers/markers-page/markers-page';

@Component({
  selector: 'app-root',
  imports: [MarkersPage],
  templateUrl: './app.html',
})
export class App {}
