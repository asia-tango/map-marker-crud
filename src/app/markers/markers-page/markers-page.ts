import { Component, inject } from '@angular/core';
import { Store } from '@ngxs/store';

import { MapView } from '../map/map-view/map-view';
import { MarkerPanel } from '../marker-panel/marker-panel';
import { MarkersState } from '../state/markers.state';

@Component({
  selector: 'app-markers-page',
  imports: [MapView, MarkerPanel],
  templateUrl: './markers-page.html',
  styleUrl: './markers-page.scss',
})
export class MarkersPage {
  private readonly store = inject(Store);

  protected readonly selectedMarker = this.store.selectSignal(MarkersState.selectedMarker);
}
