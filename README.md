# QuestromNav 3D

A responsive indoor mapping and wayfinding SPA for the first floor of Boston University’s Questrom School of Business. Built with React 18, Vite, Tailwind CSS, Three.js / React Three Fiber / Drei, Zustand, Lucide, and Radix Dialog. No Mappedin API key or server is required.

## Run locally

Use Node.js 20.19+ or 22.12+ and npm.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://127.0.0.1:5173`).

```sh
npm test         # Data integrity, corridor safety, route connectivity, search
npm run build   # Creates the deployment-ready dist/ directory
npm run preview # Preview the production build
```

## Features

- Extruded 3D cutaway map with smooth pan, rotation, zoom, selection, labels, and camera transitions.
- Interactive SVG blueprint with drag, wheel zoom, and two-finger pinch zoom.
- Room-number, department, and amenity search, including fuzzy matches and keyboard selection. Press Ctrl/Cmd+K to search.
- Directory and category filters for learning spaces, centers, offices, amenities, and entrances.
- Corridor-based Dijkstra routing between arbitrary mapped rooms, landmark instructions, origin/destination swap, and a same-location state.
- Simulated blue-dot journeys with pause, resume, replay, and restart.
- Location cards with descriptions, hours, seat count where verified, directions, clipboard sharing, and bookmarks stored on the device.
- Deep links such as `?location=105`, responsive mobile directory, light/dark appearance, keyboard focus states, reduced-motion styles, accessible modal, and a 2D option when WebGL fails.
- The 3D engine is loaded separately, keeping the initial application bundle smaller.

## CAD revision — October 14, 2026

This revision replaces the earlier public-overview geometry with eight manager-supplied CAD screenshots. Shared walls, room widths, and repeated features register the crops into a common drawing coordinate system. The screenshots themselves remain private working references and are not included in the app, public assets, or downloads. This is a manual tracing of raster screenshots, not an import of the original CAD vectors.

There are 116 selectable spaces, 114 authored doorway portals, and 112 routable spaces. Office **101H is removed entirely** from the model, partitions, furniture, search, selectors, and routes. A saved bookmark or shared URL for the deleted room no longer resolves. Its former footprint is modeled as open circulation, per the user's correction; confirm the precise replacement layout on site. The old duplicate `101D-east` identifier is replaced by the CAD's single 101D, and 101I plus 102D/102E are included. CAD labels 110/112 and 115/140 are searchable circulation aliases rather than invented offices.

Door positions and widths follow the visible door symbols in the supplied screenshots. Enclosed office walls are split around the very same doorway data used by both renderers and the route graph. Routes pass from an approach point, through the door threshold, to an arrival point inside the destination. Interior suites connect to public corridors through their suite entrances. Multi-door suites choose among authored entrances. There is **no nearest-wall or nearest-corridor fallback**, and no straight line from a room center to an arbitrary corridor. Open entrances such as the 104F opening are explicitly modeled as open portals.

The model adds 373 schematic auditorium seats in sixteen fan-shaped rows, three seating banks and radial aisles; a curved stage and podium; office workstations, meeting tables, chairs, storage, stair treads, lift cabins, glazing, atrium café seating, and the sculpture landmark. Furniture follows the visible types and layout patterns, but its dimensions, seat spacing, elevations, materials and heights remain illustrative. The 373-seat capacity is retained from the earlier [Questrom Registrar reference](https://questromworld.bu.edu/qro/room-info/); the screenshot tracing does not independently verify a seating schedule.

### Geometry and routing limits

- Coordinates are drawing units, using 20 registered image pixels per unit. They are **not surveyed meters**. Crops contain small alignment differences, resolved at shared doorway boundaries. No measurements or elevations were supplied.
- Geometry is interpreted from the screenshots, not directly from the CAD file. Room ownership, current use, door locks, access restrictions, and circulation permissions require on-site verification. Some support-space names are deliberately generic.
- Room 127, Service Passage 182A, Room 198 and cropped support space 105C are visible but have no confirmed complete doorway connection. They remain selectable, with an explanation and a disabled directions button. They are excluded from route endpoint selectors. Their incomplete geometry is indicative only.
- The north wing is routed through the visible west-side corridor. An uncertain secondary connection around Room 114 is not manufactured to shorten routes.
- Automated tests verify all authored approach segments against every solid wall, including suite entrance partitions, and check that each destination is entered via its portal. This proves consistency within the traced model, not real-world access or clearance certification.
- Walking-time estimates retain the heuristic `ceil(route drawing units / 65)`, with a minimum of one minute. Calibrate only after a real building scale is confirmed.
- Susilo's displayed hours are retained from [its official page](https://questromworld.bu.edu/susilobusinesscenter/); other hours remain unconfirmed. The CAD now identifies the zone as Room 186.
- The older [BU public floor-plan overview](https://questromapps.bu.edu/maps/images/1new.png) remains a secondary reference in the help panel. The CAD screenshots take precedence for partitions and doorway positions; the user's removal of 101H takes precedence over both drawings.

This remains an independent prototype, not an official BU service or an emergency/accessibility routing system. Use posted building signage for egress and access. Live indoor positioning is not connected: the origin is selected manually and the blue dot is simulated. This CAD revision is published through the GitHub Pages workflow. The original CAD screenshots are excluded from the public source.

## Project structure

```text
src/
  App.jsx                       Application shell, directory, help modal
  main.jsx                      React entry point
  styles.css                    Responsive theme and Tailwind layers
  components/
    MapView3D.jsx               Camera rig and 3D route
    CadModel.jsx                Door-cut walls and instanced CAD detail
    MapView2D.jsx               SVG blueprint and pointer gestures
    Searchbar.jsx               Accessible fuzzy-search combobox
    WayfindingPanel.jsx         Endpoint controls, instructions, simulation
    LocationCard.jsx            Room details, share and save actions
  data/questromMapData.js        Public data-module exports
  data/cadFloorData.js           Registered CAD tracing, polygons, doors, graph
  data/furniture.js              Instanced furniture and seating layout
  lib/routing.js                Explicit portal graph, Dijkstra, search, interpolation
  lib/geometry.js               Polygon tests, wall splits and intersections
  store/useMapStore.js           Shared map and navigation state
tests/routing.test.js            Meaningful data/algorithm tests
.github/workflows/pages.yml      GitHub Pages deployment
vercel.json                     Static deployment settings
```

## Map controls

On desktop: left-drag to pan, scroll to zoom, right-drag to rotate in 3D. On touchscreens: one-finger pan, two-finger pinch and rotation in 3D; pinch in 2D. Use the on-screen zoom and reset buttons for either view. Click a space or select a directory/search result for details. Keyboard users can choose any room through search or the route selectors. The compass is a source-plan orientation reference; it does not rotate with the camera and the source does not confirm geodetic north.

The app stores only saved location IDs in localStorage, without an account or backend. Clipboard sharing requires a secure context (HTTPS or localhost); if unavailable, the location URL is displayed for copying. Google Fonts provides optional typography, with local system fallbacks if the network is unavailable. The map itself has no external asset or font dependency.

## Deploy to GitHub Pages

1. Push the contents of this project folder to a GitHub repository.
2. In **Settings → Pages → Build and deployment**, choose **GitHub Actions**.
3. Push to `main` or manually run **Deploy QuestromNav to Pages** under Actions.

The included workflow installs the locked dependencies, runs tests, builds, and deploys `dist/`. Vite uses `base: './'`, so assets and shared location links work under either a repository subpath or a custom domain. Deep links use query parameters and do not require server rewrites.

## Deploy to Vercel

Import the repository, choose the Vite framework preset, and use `npm run build` with output directory `dist`. The included `vercel.json` sets these values. No environment variables are needed.

For any static hosting provider, upload the contents of `dist/` to its web root. Serve over HTTPS for clipboard sharing. Do not open the built HTML directly from the filesystem: browsers restrict ES modules over `file://`.

## Maintain and extend

Update traced polygons, doorway normals, and their explicit graph approaches in `src/data/cadFloorData.js`. Update furniture in `src/data/furniture.js`. Preserve stable IDs so bookmarks and shared URLs remain valid. Add corridor nodes at junctions and connect bidirectional edges through observed portals. Never replace a missing door with a geometric snap. Unconfirmed doors must remain unroutable. Run `npm test` after edits. Replace the walking-time heuristic only when an actual drawing scale is verified. To add more floors, extend the dataset and connect vertical transportation in the routing graph before enabling more floor choices. A live positioning service would need a real indoor-positioning provider and appropriate user consent; browser GPS alone cannot establish a reliable indoor room-level location.

