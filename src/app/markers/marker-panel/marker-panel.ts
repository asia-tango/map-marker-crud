import { DecimalPipe } from '@angular/common';
import { Component, inject, output } from '@angular/core';
import { Store } from '@ngxs/store';

import { COORDINATE_DECIMALS, Marker } from '../marker.model';
import { DeleteMarker, SelectMarker } from '../state/markers.actions';
import { MarkersState } from '../state/markers.state';

@Component({
  selector: 'app-marker-panel',
  imports: [DecimalPipe],
  host: {
    '(document:keydown.escape)': 'close()',
  },
  templateUrl: './marker-panel.html',
  styleUrl: './marker-panel.scss',
})
export class MarkerPanel {
  private readonly store = inject(Store);

  protected readonly marker = this.store.selectSignal(MarkersState.selectedMarker);
  protected readonly coordinateFormat = `1.${COORDINATE_DECIMALS}-${COORDINATE_DECIMALS}`;

  readonly edit = output<void>();

  protected close(): void {
    this.store.dispatch(new SelectMarker(null));
  }

  protected deleteMarker(marker: Marker): void {
    if (window.confirm(`Delete "${marker.name}"?`)) {
      this.store.dispatch(new DeleteMarker(marker.id));
    }
  }
}
