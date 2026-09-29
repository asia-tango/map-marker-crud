import { TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';

import { Marker } from '../marker.model';
import { MOCK_MARKERS } from '../markers.mock';
import { AddMarker, DeleteMarker, SelectMarker, UpdateMarker } from './markers.actions';
import { MARKERS_STATE_TOKEN, MarkersState } from './markers.state';

describe('MarkersState', () => {
  let store: Store;

  const markers = () => store.selectSnapshot(MarkersState.markers);
  const selectedId = () => store.selectSnapshot(MARKERS_STATE_TOKEN).selectedId;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([MarkersState])],
    });
    store = TestBed.inject(Store);
  });

  it('starts with the 4 mock markers and no selection', () => {
    expect(markers()).toEqual(MOCK_MARKERS);
    expect(selectedId()).toBeNull();
  });

  it('AddMarker appends the marker', () => {
    const paris: Marker = { id: 'marker-5', name: 'Paris', latitude: 48.856642, longitude: 2.352243 };

    store.dispatch(new AddMarker(paris));

    expect(markers()).toHaveLength(5);
    expect(markers().at(-1)).toEqual(paris);
  });

  it('UpdateMarker changes only the target marker', () => {
    const before = markers();
    const updated: Marker = { ...before[1], name: 'Kyiv center' };

    store.dispatch(new UpdateMarker(updated));

    const after = markers();
    expect(after[1]).toEqual(updated);
    expect(after[0]).toBe(before[0]);
    expect(after[2]).toBe(before[2]);
    expect(after[3]).toBe(before[3]);
  });

  it('DeleteMarker removes the marker and clears the selection if it was selected', () => {
    store.dispatch(new SelectMarker('marker-2'));

    store.dispatch(new DeleteMarker('marker-2'));

    expect(markers().map((marker) => marker.id)).toEqual(['marker-1', 'marker-3', 'marker-4']);
    expect(selectedId()).toBeNull();
  });

  it('DeleteMarker keeps the selection when another marker is deleted', () => {
    store.dispatch(new SelectMarker('marker-1'));

    store.dispatch(new DeleteMarker('marker-2'));

    expect(selectedId()).toBe('marker-1');
  });

  it('SelectMarker sets selectedId', () => {
    store.dispatch(new SelectMarker('marker-3'));

    expect(selectedId()).toBe('marker-3');
  });
});
