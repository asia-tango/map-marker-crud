import { Component, computed, inject, signal } from '@angular/core';
import { Store } from '@ngxs/store';

import { MapView } from '../map/map-view/map-view';
import { Marker } from '../marker.model';
import { MarkerForm, MarkerFormValue } from '../marker-form/marker-form';
import { MarkerPanel } from '../marker-panel/marker-panel';
import { AddMarker, SelectMarker, UpdateMarker } from '../state/markers.actions';
import { MarkersState } from '../state/markers.state';

type MarkerDraft =
  | { mode: 'create'; name: string; latitude: number; longitude: number }
  | { mode: 'edit'; id: string; name: string; latitude: number; longitude: number };

@Component({
  selector: 'app-markers-page',
  imports: [MapView, MarkerForm, MarkerPanel],
  templateUrl: './markers-page.html',
  styleUrl: './markers-page.scss',
})
export class MarkersPage {
  private readonly store = inject(Store);

  protected readonly selectedMarker = this.store.selectSignal(MarkersState.selectedMarker);
  protected readonly draft = signal<MarkerDraft | null>(null);

  protected readonly draftPoint = computed(() => {
    const draft = this.draft();
    return draft?.mode === 'create'
      ? { latitude: draft.latitude, longitude: draft.longitude }
      : null;
  });

  protected onMarkerClicked(id: string): void {
    if (this.draft()) {
      return;
    }
    this.store.dispatch(new SelectMarker(id));
  }

  protected onMapClicked({ latitude, longitude }: Pick<Marker, 'latitude' | 'longitude'>): void {
    const draft = this.draft();
    if (draft?.mode === 'edit') {
      return;
    }
    if (draft) {
      this.draft.set({ ...draft, latitude, longitude });
      return;
    }
    if (this.selectedMarker()) {
      this.store.dispatch(new SelectMarker(null));
    }
    this.draft.set({ mode: 'create', name: '', latitude, longitude });
  }

  protected onEdit(): void {
    const marker = this.selectedMarker();
    if (marker) {
      this.draft.set({ mode: 'edit', ...marker });
    }
  }

  protected onSaved({ name, latitude, longitude }: MarkerFormValue): void {
    const draft = this.draft();
    if (!draft) {
      return;
    }
    const values = { name: name.trim(), latitude, longitude };

    if (draft.mode === 'create') {
      const id = crypto.randomUUID();
      this.store.dispatch(new AddMarker({ id, ...values }));
      this.store.dispatch(new SelectMarker(id));
    } else {
      this.store.dispatch(new UpdateMarker({ id: draft.id, ...values }));
    }
    this.draft.set(null);
  }

  protected onCancelled(): void {
    if (this.draft()?.mode === 'edit') {
      this.store.dispatch(new SelectMarker(null));
    }
    this.draft.set(null);
  }
}
