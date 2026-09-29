import { Marker } from '../marker.model';

export class AddMarker {
  static readonly type = '[Markers] Add';
  constructor(public readonly marker: Marker) {}
}

export class UpdateMarker {
  static readonly type = '[Markers] Update';
  constructor(public readonly marker: Marker) {}
}

export class DeleteMarker {
  static readonly type = '[Markers] Delete';
  constructor(public readonly id: string) {}
}

export class SelectMarker {
  static readonly type = '[Markers] Select';
  constructor(public readonly id: string | null) {}
}
