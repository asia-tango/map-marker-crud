import { Component } from '@angular/core';

import { MapView } from './map/map-view';

@Component({
  selector: 'app-markers-page',
  imports: [MapView],
  template: '<app-map-view></app-map-view>',
})
export class MarkersPage {}
