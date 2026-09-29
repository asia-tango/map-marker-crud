import { Injectable } from '@angular/core';
import Feature from 'ol/Feature';
import OlMap from 'ol/Map';
import View from 'ol/View';
import Point from 'ol/geom/Point';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import CircleStyle from 'ol/style/Circle';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';
import Text from 'ol/style/Text';

import { Marker } from '../marker.model';

const INITIAL_CENTER = fromLonLat([20, 50]);
const INITIAL_ZOOM = 5;

const POINT_IMAGE = new CircleStyle({
  radius: 7,
  fill: new Fill({ color: '#d32f2f' }),
  stroke: new Stroke({ color: '#ffffff', width: 2 }),
});

@Injectable()
export class MarkerMapService {
  private readonly source = new VectorSource<Feature<Point>>();
  private readonly map = new OlMap({
    layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source: this.source })],
    view: new View({ center: INITIAL_CENTER, zoom: INITIAL_ZOOM }),
  });

  private readonly features = new Map<string, Feature<Point>>();
  private readonly renderedMarkers = new Map<string, Marker>();

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

  destroy(): void {
    this.map.setTarget(undefined);
    this.map.dispose();
  }

  private createFeature(marker: Marker): Feature<Point> {
    const feature = new Feature(new Point(toCoordinate(marker)));
    feature.setId(marker.id);
    feature.setStyle(createStyle(marker.name));
    return feature;
  }

  private updateFeature(feature: Feature<Point>, marker: Marker): void {
    feature.getGeometry()?.setCoordinates(toCoordinate(marker));
    feature.setStyle(createStyle(marker.name));
  }
}

function toCoordinate(marker: Marker): number[] {
  return fromLonLat([marker.longitude, marker.latitude]);
}

function createStyle(name: string): Style {
  return new Style({
    image: POINT_IMAGE,
    text: new Text({
      text: name,
      offsetY: -16,
      font: '13px sans-serif',
      fill: new Fill({ color: '#212121' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 }),
    }),
  });
}
