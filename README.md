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
- Location cards with descriptions, hours, schematic seat count, directions, clipboard sharing, and bookmarks stored on the device.
- Deep links such as `?location=105`, responsive mobile directory, light/dark appearance, keyboard focus states, reduced-motion styles, accessible modal, and a 2D option when WebGL fails.
- The 3D engine is loaded separately, keeping the initial application bundle smaller.

## CAD revision — October 15, 2026

This revision registers fourteen manager-supplied CAD screenshots. The latest close-up clarifies passage 113, the Undergraduate lounge/reception, conference room 114, office-hours room 150 and the two successive women's restroom doors. Department locations and one-way access were explicitly confirmed by the user. The screenshots remain private and are excluded from the app, repository and downloads. This is manual tracing of raster references, not an import of CAD vectors.

There are **122 selectable spaces, 130 authored navigation portals, 127 rendered portals and 117 visitor-routable spaces**. Shared thresholds and open-floor arrival zones do not create duplicate physical door frames. Office **101H remains excluded** from geometry, doors, furniture, labels, search, routes and saved links. Its former area remains open circulation. IDs refer to physical locations; the existing `udc` link selects Undergraduate Development Center in rooms 115–140, while 101/102 contain Graduate Admissions & Financial Aid. Names, search and route instructions reflect this change.

- **Auditorium:** 105A, 105B and 105D are connected areas of the same entrance foyer, without invented dividing walls. Internal doors connect it to the auditorium. 105C is the enclosed projector cabin with its own door. The rebuilt shallow timber stage has a bowed front, paneled backdrop, lectern and side steps. Three seating banks face west toward the stage, with two clear cross aisles and perimeter circulation. The 373 modeled seats are schematic; they are not a verified seat-by-seat schedule or occupancy certificate.
- **Feld / suite 108:** public entry goes through the main Feld Center doorway, then its internal corridor. Both public-facing suite 108 doors are modeled as exit only to enforce the user's Feld-only entry requirement. Each exit portal has outward-only graph edges. The internal suite junction stays bidirectional. Dijkstra respects those directions, so the return journey may be shorter. Existing bookmarks still use physical room IDs.
- **Undergraduate / passage 113:** the atrium connects directly through corridor 113 and its double doors into area 115, giving rooms such as 116 a short public approach. The west door between 135 and 138 permits exit only; it cannot be used to enter from the west lobby. This restriction does not apply to the Silber Way exterior entrance. Area 115 is an open lounge with a schematic upholstered couch; 115A is the CAD-shaped L reception counter with a visitor arrival in front of the desk. Conference room 114 has two working route entrances, selected according to the approach. Room 150 is an office-hours and question-session space with schematic meeting furniture. The pink CAD runs at 114, 150 and 150A are rendered as glazing above solid low sills and never become route openings.
- **Women's restroom 189:** two successive physical doors connect the public stair-side approach to an enclosed vestibule and then the restroom. The route crosses both thresholds in order, with a vestibule instruction. The model does not treat these as two independent doors directly from the atrium into the restroom.
- **Atrium:** the white floor in the latest crop is a free-walking region. A visibility graph joins open-floor points directly where there is a clear line past walls and the central sculpture. It replaces fixed corridor bends across the atrium. A ring outside the sculpture footprint supplies short paths around it when a straight crossing is blocked. No artificial corridor is required to reach the main stairs. Tree-like planters are removed. Four CAD seating groups have 98 stylized upholstered seats, 32 café/coffee tables, oak finishes, and warm neutral rugs. These are model counts, not a verified furniture inventory. 2D and 3D share the layout.
- **East core:** passenger lifts 181A/C/D open to 181K. Freight elevator 181B has opposing doorways to 181K and 185A; the vestibule meets its rear threshold. The east stair landing 183A is physically joined to passage 184 at the confirmed door. Both freight elevator 181B and the east service staircase are visible and searchable but excluded from all visitor origins, destinations, and routing edges. `serviceConnections` records these physical connections without enabling emergency routing. Lift doors have metal panels and call buttons.
- **Susilo:** the basic interior follows the CAD reception counter’s L-shaped footprint and west-wall shelving location. Counter panels, worktops, monitors and generic paper stacks are schematic pending on-site photographs. The former separate office identity is removed from public labels, search, URLs and route selectors. Its footprint is grouped under 187B, retaining the physical divider and existing door. Its service-side door is drawn without exposing a new visitor route or claiming a certified refuge.
- **188:** an open loading dock with two raised shutter bays and the retained center support. It is no longer drawn as a closed office. Existing visitor endpoint availability is retained; no freight-elevator or service-stair route is introduced.
- **Entrances:** framed glazing, multiple door bays, pull handles, transoms, entrance mats and stone surrounds replace oversized door leaves. The main entrance has a Questrom fascia. Silber Way retains its CAD vestibule and a photo-informed material treatment.
- **198:** an exterior asphalt parking passage with lane markings and a barrier, outside the indoor slab. It is selectable for identification but excluded from pedestrian routing.

Door portals cut the same wall geometry used by the 2D and 3D renderers. The route graph passes through an authored approach, threshold and arrival point. Interior suites connect only through explicitly declared junctions. No nearest-wall or nearest-corridor fallback is used. Automated tests cover every navigation segment against every solid wall, destination connectivity, directed suite access, department search, lift orientation, auditorium seats and atrium clearance.

### Architectural photo references

The materials and proportions were informed by [BU's exterior entrance photograph](https://www.bu.edu/online/degrees-certificates/master-of-business-administration/online-mba/), [BU Today's lobby photograph](https://www.bu.edu/articles/2024/best-summer-study-spots-on-bu-campus/) and the [Questrom LocationsHub auditorium/gallery](https://rs.locationshub.com/Home/LocationDetail?rsLocationId=065-10242750). Photographs are references only and are not redistributed. The west-door close-up was not independently established; its footprint and door configuration follow the CAD, with finishes interpreted from the building photos. The roofless presentation intentionally keeps navigation visible.

### Geometry and routing limits

- Coordinates are drawing units, using 20 registered image pixels per unit. They are **not surveyed meters**. Crops contain small alignment differences, resolved at shared doorway boundaries. No measurements or elevations were supplied.
- Geometry is interpreted from the screenshots, not directly from the CAD file. Room ownership, current use, door locks, access restrictions, and circulation permissions require on-site verification. Some support-space names are deliberately generic.
- Room 127 and Service Passage 182A lack a confirmed complete doorway connection and are not routable. Exterior Parking Way 198 is also excluded from pedestrian endpoints. All three remain selectable with an explanation and disabled directions. The new close-up establishes a door for projector cabin 105C, which is now connected.
- Passage 113 and both conference-room entrances follow the newest close-up. The door between 135 and 138 is exit only; future access changes must update its directed graph edges as well as its visible annotation.
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
    ArchitecturalDetails.jsx    Entrances, Susilo interior, raised shutters, lift doors
    MapView2D.jsx               SVG blueprint and pointer gestures
    Searchbar.jsx               Accessible fuzzy-search combobox
    WayfindingPanel.jsx         Endpoint controls, instructions, simulation
    LocationCard.jsx            Room details, share and save actions
  data/questromMapData.js        Public data-module exports
  data/cadFloorData.js           Registered CAD tracing, polygons, doors, graph
  data/furniture.js              Instanced office furniture and auditorium seats
  data/atriumLayout.js            Shared CAD seating groups and free-walking region
  data/susiloLayout.js            Counter footprint and basic shelf layout
  data/northWingLayout.js         Undergraduate counter, couch and office-hours fixtures
  lib/atriumNavigation.js         Open-floor visibility connections around sculpture
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

