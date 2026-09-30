# Map markers

CRUD for map markers with Angular 22, NGXS and OpenLayers.

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
- Add a marker by clicking the map, with a draft point preview.
- Edit a marker.
- Delete a marker with confirmation.
- Mobile layout.

## Key decisions

- The NGXS store is the single source of truth; the map only draws state and reports clicks.
- All OpenLayers code lives in one service; components never import OpenLayers.
- Markers on the map are updated incrementally by id instead of redrawing all of them.
- The create/edit draft is local UI state with an explicit mode (create | edit), so invalid states are impossible; it is not in the store.
- Coordinates are stored in degrees and rounded to 6 decimals (about 11 cm): a map click returns about 15 digits, which is false precision.
- While the form is open, marker clicks are ignored, and while editing the map is locked, so map and marker clicks never replace an open form.
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
- Reverse geocoding to prefill the marker name.
- E2E tests (for example, Playwright).
- Clustering or a WebGL layer, and loading by visible extent, for many markers.
- A custom confirm dialog with undo.

## Notes

Built with AI assistance (Claude Code). I reviewed each step, made the design decisions and ran all checks myself.
