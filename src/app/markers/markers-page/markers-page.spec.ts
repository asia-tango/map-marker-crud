import { Component, input, output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideStore, Store } from '@ngxs/store';

import { MapView } from '../map/map-view/map-view';
import { Marker } from '../marker.model';
import { MOCK_MARKERS } from '../markers.mock';
import { MarkersState } from '../state/markers.state';
import { MarkersPage } from './markers-page';

type Coordinates = Pick<Marker, 'latitude' | 'longitude'>;

@Component({
  selector: 'app-map-view',
  template: '',
})
class MapViewStub {
  readonly draft = input<Coordinates | null>(null);
  readonly markerClicked = output<string>();
  readonly mapClicked = output<Coordinates>();
}

describe('MarkersPage', () => {
  let fixture: ComponentFixture<MarkersPage>;
  let store: Store;
  let element: HTMLElement;
  let map: MapViewStub;

  const markers = () => store.selectSnapshot(MarkersState.markers);
  const selectedMarker = () => store.selectSnapshot(MarkersState.selectedMarker);
  const heading = () => element.querySelector('h2')?.textContent?.trim();
  const button = (text: string) =>
    Array.from(element.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === text,
    )!;

  function click(text: string): void {
    button(text).click();
    fixture.detectChanges();
  }

  function typeName(value: string): void {
    const field = element.querySelector<HTMLInputElement>('#marker-name')!;
    field.value = value;
    field.dispatchEvent(new Event('input'));
    fixture.detectChanges();
  }

  function clickMarker(id: string): void {
    map.markerClicked.emit(id);
    fixture.detectChanges();
  }

  function clickMap(coordinates: Coordinates): void {
    map.mapClicked.emit(coordinates);
    fixture.detectChanges();
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MarkersPage],
      providers: [provideStore([MarkersState])],
    }).overrideComponent(MarkersPage, {
      remove: { imports: [MapView] },
      add: { imports: [MapViewStub] },
    });
    store = TestBed.inject(Store);

    fixture = TestBed.createComponent(MarkersPage);
    fixture.detectChanges();
    element = fixture.nativeElement;
    map = fixture.debugElement.query(By.directive(MapViewStub)).componentInstance;
  });

  it('creates a marker from a map click and selects it', () => {
    clickMap({ latitude: 48.856642, longitude: 2.352243 });
    expect(heading()).toBe('New marker');

    typeName('  Paris  ');
    click('Save');

    const created = markers().at(-1)!;
    expect(markers()).toHaveLength(5);
    expect(created).toMatchObject({ name: 'Paris', latitude: 48.856642, longitude: 2.352243 });
    expect(selectedMarker()).toBe(created);
    expect(heading()).toBe('Paris');
  });

  it('updates the selected marker on edit', () => {
    clickMarker('marker-2');
    click('Edit');
    expect(heading()).toBe('Edit marker');

    typeName('Kyiv center');
    click('Save');

    expect(markers()).toHaveLength(4);
    expect(markers()[1]).toEqual({ ...MOCK_MARKERS[1], name: 'Kyiv center' });
    expect(selectedMarker()?.id).toBe('marker-2');
    expect(heading()).toBe('Kyiv center');
  });

  it('changes nothing and clears the selection when editing is cancelled', () => {
    clickMarker('marker-2');
    click('Edit');

    typeName('Something else');
    click('Cancel');

    expect(markers()).toEqual(MOCK_MARKERS);
    expect(selectedMarker()).toBeNull();
    expect(element.querySelector('.sidebar')).toBeNull();
  });

  it('ignores map clicks while editing', () => {
    clickMarker('marker-2');
    click('Edit');

    clickMap({ latitude: 10, longitude: 10 });

    expect(heading()).toBe('Edit marker');
    expect(element.querySelector<HTMLInputElement>('#marker-latitude')!.value).toBe(
      String(MOCK_MARKERS[1].latitude),
    );
    expect(map.draft()).toBeNull();
  });

  it('ignores marker clicks while the form is open', () => {
    clickMap({ latitude: 48.856642, longitude: 2.352243 });

    clickMarker('marker-1');

    expect(selectedMarker()).toBeNull();
    expect(heading()).toBe('New marker');
  });
});
