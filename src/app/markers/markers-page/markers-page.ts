import { Component, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';

import { MapView } from '../map/map-view/map-view';
import { Marker } from '../marker.model';
import { MarkerForm, MarkerFormValue } from '../marker-form/marker-form';
import { MarkerPanel } from '../marker-panel/marker-panel';
import { AddMarker, SelectMarker } from '../state/markers.actions';
import { MarkersState } from '../state/markers.state';

@Component({
  selector: 'app-markers-page',
  imports: [MapView, MarkerForm, MarkerPanel],
  templateUrl: './markers-page.html',
  styleUrl: './markers-page.scss',
})
export class MarkersPage {
  private readonly store = inject(Store);

  protected readonly selectedMarker = this.store.selectSignal(MarkersState.selectedMarker);
  protected readonly createAt = signal<Pick<Marker, 'latitude' | 'longitude'> | null>(null);

  protected onMarkerClicked(id: string): void {
    if (this.createAt()) {
      return;
    }
    this.store.dispatch(new SelectMarker(id));
  }

  protected onMapClicked(coords: Pick<Marker, 'latitude' | 'longitude'>): void {
    if (this.selectedMarker()) {
      this.store.dispatch(new SelectMarker(null));
    }
    this.createAt.set(coords);
  }

  protected onSaved({ name, latitude, longitude }: MarkerFormValue): void {
    const id = crypto.randomUUID();
    this.store.dispatch(new AddMarker({ id, name: name.trim(), latitude, longitude }));
    this.createAt.set(null);
    this.store.dispatch(new SelectMarker(id));
  }

  protected onCancelled(): void {
    this.createAt.set(null);
  }
}
