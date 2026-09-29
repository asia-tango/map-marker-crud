import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideStore, Store } from '@ngxs/store';
import { vi } from 'vitest';

import { SelectMarker } from '../state/markers.actions';
import { MarkersState } from '../state/markers.state';
import { MarkerPanel } from './marker-panel';

describe('MarkerPanel', () => {
  let fixture: ComponentFixture<MarkerPanel>;
  let store: Store;
  let element: HTMLElement;

  const markerIds = () => store.selectSnapshot(MarkersState.markers).map((marker) => marker.id);
  const button = (text: string) =>
    Array.from(element.querySelectorAll('button')).find(
      (candidate) => candidate.textContent?.trim() === text,
    )!;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore([MarkersState])],
    });
    store = TestBed.inject(Store);
    store.dispatch(new SelectMarker('marker-2'));

    fixture = TestBed.createComponent(MarkerPanel);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('keeps the marker when the delete is not confirmed', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);

    button('Delete').click();

    expect(confirm).toHaveBeenCalledWith('Delete "Kyiv"?');
    expect(markerIds()).toContain('marker-2');
  });

  it('deletes the marker when the delete is confirmed', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    button('Delete').click();

    expect(markerIds()).not.toContain('marker-2');
    expect(store.selectSnapshot(MarkersState.selectedMarker)).toBeNull();
  });

  it('clears the selection on the × button', () => {
    expect(element.querySelector('h2')?.textContent).toBe('Kyiv');

    element.querySelector<HTMLButtonElement>('button[aria-label="Close"]')!.click();
    fixture.detectChanges();

    expect(store.selectSnapshot(MarkersState.selectedMarker)).toBeNull();
    expect(element.querySelector('h2')).toBeNull();
  });
});
