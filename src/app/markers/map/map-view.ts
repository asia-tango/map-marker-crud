import { Component, DestroyRef, ElementRef, afterNextRender, effect, inject } from '@angular/core';
import { Store } from '@ngxs/store';

import { MarkersState } from '../state/markers.state';
import { MarkerMapService } from './marker-map.service';

@Component({
  selector: 'app-map-view',
  template: '',
  styles: `
    :host {
      display: block;
      height: 100vh;
    }
  `,
  providers: [MarkerMapService],
})
export class MapView {
  private readonly store = inject(Store);
  private readonly mapService = inject(MarkerMapService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly markers = this.store.selectSignal(MarkersState.markers);

  constructor() {
    afterNextRender(() => this.mapService.attach(this.host.nativeElement));
    inject(DestroyRef).onDestroy(() => this.mapService.destroy());

    effect(() => this.mapService.setMarkers(this.markers()));
  }
}
