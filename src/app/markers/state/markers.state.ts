import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext, StateToken } from '@ngxs/store';
import { append, patch, removeItem, updateItem } from '@ngxs/store/operators';

import { Marker } from '../marker.model';
import { MOCK_MARKERS } from '../markers.mock';
import { AddMarker, DeleteMarker, SelectMarker, UpdateMarker } from './markers.actions';

export interface MarkersStateModel {
  markers: Marker[];
  selectedId: string | null;
}

export const MARKERS_STATE_TOKEN = new StateToken<MarkersStateModel>('markers');

@State<MarkersStateModel>({
  name: MARKERS_STATE_TOKEN,
  defaults: {
    markers: MOCK_MARKERS,
    selectedId: null,
  },
})
@Injectable()
export class MarkersState {
  @Selector()
  static markers(state: MarkersStateModel): Marker[] {
    return state.markers;
  }

  @Selector()
  static selectedMarker(state: MarkersStateModel): Marker | null {
    return state.markers.find((marker) => marker.id === state.selectedId) ?? null;
  }

  @Action(AddMarker)
  addMarker(ctx: StateContext<MarkersStateModel>, { marker }: AddMarker): void {
    ctx.setState(patch({ markers: append([marker]) }));
  }

  @Action(UpdateMarker)
  updateMarker(ctx: StateContext<MarkersStateModel>, { marker }: UpdateMarker): void {
    ctx.setState(
      patch({ markers: updateItem<Marker>((item) => item.id === marker.id, marker) }),
    );
  }

  @Action(DeleteMarker)
  deleteMarker(ctx: StateContext<MarkersStateModel>, { id }: DeleteMarker): void {
    const { selectedId } = ctx.getState();
    ctx.setState(
      patch({
        markers: removeItem<Marker>((item) => item.id === id),
        selectedId: selectedId === id ? null : selectedId,
      }),
    );
  }

  @Action(SelectMarker)
  selectMarker(ctx: StateContext<MarkersStateModel>, { id }: SelectMarker): void {
    ctx.setState(patch({ selectedId: id }));
  }
}
