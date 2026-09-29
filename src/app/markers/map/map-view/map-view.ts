import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngxs/store';

import { Marker } from '../../marker.model';
import { MarkersState } from '../../state/markers.state';
import { MarkerMapService } from '../marker-map.service';

@Component({
  selector: 'app-map-view',
  template: '',
  styles: `
    :host {
      display: block;
      height: 100%;
    }
  `,
  providers: [MarkerMapService],
})
export class MapView {
  private readonly store = inject(Store);
  private readonly mapService = inject(MarkerMapService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly markers = this.store.selectSignal(MarkersState.markers);
  private readonly selectedMarker = this.store.selectSignal(MarkersState.selectedMarker);

  readonly draft = input<Pick<Marker, 'latitude' | 'longitude'> | null>(null);

  readonly markerClicked = output<string>();
  readonly mapClicked = output<Pick<Marker, 'latitude' | 'longitude'>>();

  constructor() {
    afterNextRender(() => this.mapService.attach(this.host.nativeElement));
    inject(DestroyRef).onDestroy(() => this.mapService.destroy());

    effect(() => this.mapService.setMarkers(this.markers()));
    effect(() => this.mapService.setSelected(this.selectedMarker()?.id ?? null));
    effect(() => this.mapService.setDraft(this.draft()));

    this.mapService.clicks$.pipe(takeUntilDestroyed()).subscribe((click) => {
      if (click.kind === 'marker') {
        this.markerClicked.emit(click.id);
      } else {
        this.mapClicked.emit({ latitude: click.latitude, longitude: click.longitude });
      }
    });
  }
}
