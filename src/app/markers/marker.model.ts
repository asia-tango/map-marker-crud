// 6 decimal places ≈ 11 cm, the usual GPS precision.
// More digits from a map click are false precision.
export const COORDINATE_DECIMALS = 6;

export interface Marker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}
