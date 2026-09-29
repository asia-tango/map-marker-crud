import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import { unByKey } from 'ol/Observable';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';
import { Observable, Subject } from 'rxjs';

import { COORDINATE_DECIMALS, Marker } from '../marker.model';

export type MapClick =
  | { kind: 'marker'; id: string }
  | { kind: 'empty'; latitude: number; longitude: number };

const INITIAL_CENTER = fromLonLat([20, 50]);
const INITIAL_ZOOM = 5;
const HIT_TOLERANCE = 5;

const POINT_IMAGE = new CircleStyle({
  radius: 7,
  fill: new Fill({ color: '#d32f2f' }),
  stroke: new Stroke({ color: '#ffffff', width: 2 }),
});

const SELECTED_POINT_IMAGE = new CircleStyle({
  radius: 10,
  fill: new Fill({ color: '#1976d2' }),
  stroke: new Stroke({ color: '#ffffff', width: 2 }),
});

const DRAFT_STYLE = new Style({
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: '#00c853' }),
    stroke: new Stroke({ color: '#ffffff', width: 2 }),
  }),
});

@Injectable()
export class MarkerMapService {
  private readonly source = new VectorSource<Feature<Point>>();
  private readonly markersLayer = new VectorLayer({ source: this.source });
  private readonly draftSource = new VectorSource<Feature<Point>>();
  private readonly draftLayer = new VectorLayer({ source: this.draftSource, style: DRAFT_STYLE });
  private readonly map = new OlMap({
    layers: [new TileLayer({ source: new OSM() }), this.markersLayer, this.draftLayer],
    view: new View({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM }),
  });
  private draftFeature: Feature<Point> | null = null;

  private readonly features = new Map<string, Feature<Point>>();
  private readonly renderedMarkers = new Map<string, Marker>();
  private selectedId: string | null = null;

  private readonly clicksSubject = new Subject<MapClick>();
  readonly clicks$: Observable<MapClick> = this.clicksSubject.asObservable();

  private readonly clickListener = this.map.on('singleclick', (event) => {
    const id = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature.getId(), {
      hitTolerance: HIT_TOLERANCE,
      // Only the markers layer: the draft point must never count as a marker.
      layerFilter: (layer) => layer === this.markersLayer,
    });

    if (typeof id === 'string') {
      this.clicksSubject.next({ kind: 'marker', id });
    } else {
      const [longitude, latitude] = toLonLat(event.coordinate).map(roundCoordinate);
      this.clicksSubject.next({ kind: 'empty', latitude, longitude });
    }
  });

  attach(target: HTMLElement): void {
    this.map.setTarget(target);
  }

  setMarkers(markers: readonly Marker[]): void {
    const nextIds = new Set(markers.map((marker) => marker.id));

    for (const [id, feature] of this.features) {
      if (!nextIds.has(id)) {
        this.source.removeFeature(feature);
        this.features.delete(id);
        this.renderedMarkers.delete(id);
      }
    }

    const added: Feature<Point>[] = [];
    for (const marker of markers) {
      const feature = this.features.get(marker.id);
      if (!feature) {
        const created = this.createFeature(marker);
        this.features.set(marker.id, created);
        added.push(created);
      } else if (this.renderedMarkers.get(marker.id) !== marker) {
        this.updateFeature(feature, marker);
      }
      this.renderedMarkers.set(marker.id, marker);
    }
    this.source.addFeatures(added);
  }

  setSelected(id: string | null): void {
    if (id === this.selectedId) {
      return;
    }
    const previousId = this.selectedId;
    this.selectedId = id;
    this.restyle(previousId);
    this.restyle(id);
  }

  setDraft(coords: Pick<Marker, 'latitude' | 'longitude'> | null): void {
    if (!coords) {
      this.draftSource.clear();
      this.draftFeature = null;
    } else if (this.draftFeature) {
      this.draftFeature.getGeometry()?.setCoordinates(toCoordinate(coords));
    } else {
      this.draftFeature = new Feature(new Point(toCoordinate(coords)));
      this.draftSource.addFeature(this.draftFeature);
    }
  }

  destroy(): void {
    unByKey(this.clickListener);
    this.clicksSubject.complete();
    this.map.setTarget(undefined);
    this.map.dispose();
  }

  private createFeature(marker: Marker): Feature<Point> {
    const feature = new Feature(new Point(toCoordinate(marker)));
    feature.setId(marker.id);
    feature.setStyle(createStyle(marker.name, marker.id === this.selectedId));
    return feature;
  }

  private updateFeature(feature: Feature<Point>, marker: Marker): void {
    feature.getGeometry()?.setCoordinates(toCoordinate(marker));
    feature.setStyle(createStyle(marker.name, marker.id === this.selectedId));
  }

  private restyle(id: string | null): void {
    if (id === null) {
      return;
    }
    const feature = this.features.get(id);
    const marker = this.renderedMarkers.get(id);
    if (feature && marker) {
      feature.setStyle(createStyle(marker.name, id === this.selectedId));
    }
  }
}

function roundCoordinate(value: number): number {
  const factor = 10 ** COORDINATE_DECIMALS;
  return Math.round(value * factor) / factor;
}

function toCoordinate({ latitude, longitude }: Pick<Marker, 'latitude' | 'longitude'>): number[] {
  return fromLonLat([longitude, latitude]);
}

function createStyle(name: string, selected: boolean): Style {
  return new Style({
    image: selected ? SELECTED_POINT_IMAGE : POINT_IMAGE,
    zIndex: selected ? 1 : 0,
    text: new Text({
      text: name,
      offsetY: selected ? -19 : -16,
      font: '13px sans-serif',
      fill: new Fill({ color: '#212121' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 }),
    }),
  });
}
