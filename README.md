# Map markers

CRUD for map markers with Angular 22, NGXS and OpenLayers.

**Live demo:** https://asia-tango.github.io/map-marker-crud/

## Requirements

- Node ^22.22.3, ^24.15.0 or >=26.0.0 (the versions supported by Angular 22)

## Getting started

```bash
npm install
npm start                    # http://localhost:4200
npx ng test --watch=false    # unit and component tests
npx ng lint
npx ng build
```

## Features

- View markers on the map.
- Select a marker to see its details.
- Add a marker by clicking the map: a green draft point shows where it will be placed (click again to move it); it becomes a marker on Save and disappears on Cancel.
- Edit a marker.
- Delete a marker with confirmation.
- Mobile layout (below 768px).

## Key decisions

- The NGXS store is the single source of truth; the map only draws state and reports clicks.
- All OpenLayers code lives in one service; components never import OpenLayers.
- Markers on the map are updated incrementally by id instead of redrawing all of them.
- The create/edit draft is local UI state with an explicit mode (create | edit), so invalid states are impossible; it is not in the store.
- Coordinates are stored in degrees. Map clicks are rounded to 6 decimals (about 11 cm): a click returns about 15 digits, which is false precision.
- While the form is open, marker clicks are ignored, and while editing the map is locked, so map and marker clicks never replace an open form.
- Cancel (button, × or Escape) always closes the sidebar, also in edit mode, to keep one predictable rule; Save keeps the marker selected to show the result.
- In create mode the coordinates come only from map clicks (readonly fields), so the green preview always matches what is saved; in edit mode the map is locked and coordinates are corrected in the fields.
- The details panel is on the right (inspector pattern) and moves to the bottom on mobile; the OpenStreetMap attribution always stays visible.
- Marker names allow any characters (apostrophes, Cyrillic, etc.); they are shown only through Angular interpolation and canvas labels, so HTML is never executed (no innerHTML).
- Native confirm for delete: simple and accessible, as the task asked to keep it simple.
- Long labels are truncated on the map; the full name is in the panel.
- The initial bundle budget is raised because OpenLayers is the main content of the page.

## Tests

Unit and component tests cover the store actions and the core user flows: create, edit, cancel, delete with confirmation and form validation.
OpenLayers rendering is not covered by these tests (there is no canvas in jsdom); it would be covered by E2E tests.

## Known limitations

State is in memory only, so a page reload resets the markers to the mock data (no backend or persistence was required).

## With more time

- Persistence via @ngxs/storage-plugin, or a backend through NGXS actions.
- An accessible marker list synced with the map: canvas markers can't be reached with a keyboard or a screen reader.
- Loading only the markers in the visible part of the map, for large datasets.
- Real-time sync: a backend broadcasting the same NGXS actions over WebSocket.
- Store the measurement uncertainty of each clicked point (one map pixel at the current zoom) and show it in the panel.
- E2E tests (for example, Playwright).

## Notes

My background is in metrology, which is why coordinate precision got extra attention (rounding, uncertainty).

Built with AI assistance (Claude Code). I reviewed each step, made the design decisions and ran all checks myself.
