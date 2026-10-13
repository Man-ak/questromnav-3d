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

## Map data and accuracy

The source is [BU’s published first-floor drawing](https://questromapps.bu.edu/maps/images/1new.png), linked from [Questrom Building Floor Maps](https://questromapps.bu.edu/maps/maps595.cfm), accessed October 13, 2026. The user’s message did not include an attached floor-plan file. Geometry was manually digitized from this public reference.

The dataset preserves room and suite numbers printed on the source, including the numbered undergraduate offices, 108/104/101/102 lettered offices, 114, 138, 140A, and 150/150A. It does **not** invent missing 137, 139, or 140 rooms. The source prints two “D” labels within the 101 suite; the eastern one uses the internal ID `101D-east` to avoid a duplicate key.

`src/data/questromMapData.js` holds each room’s ID, number, polygon, center, type, floor, entrance point, description, hours, and rendering metadata. Coordinates use x increasing right/east and z increasing down/south, matching the source drawing. They are **drawing units, not meters**. Doorway locations and graph connections are approximate. Walking times use a documented heuristic (`ceil(route drawing units / 65)`), not a surveyed building scale. No distance in meters is represented as verified.

Capacity for Auditorium 105 (373) comes from [Questrom Registrar’s room information](https://questromworld.bu.edu/qro/room-info/). Susilo hours come from [the center’s official page](https://questromworld.bu.edu/susilobusinesscenter/); hours for other spaces remain explicitly unconfirmed. That page lists Susilo as Room 186; the source drawing labels the zone by name, so its internal ID is `susilo` rather than an invented room number.

This is an independent prototype, not an official BU service. Before using it for real-world navigation, validate polygons, doorway positions, walking scale, room ownership, operating hours, and corridor access with building staff. The source does not identify emergency exits or certify accessible routes, so the app does not invent an evacuation overlay or an accessibility guarantee. Entrance searches recognize “exit”, and staircases are mapped; follow posted building signage for egress. Indoor GPS is not implemented: the origin is manually selected and the blue dot is a simulation. Default origin is Main Entrance.

## Project structure

```text
src/
  App.jsx                       Application shell, directory, help modal
  main.jsx                      React entry point
  styles.css                    Responsive theme and Tailwind layers
  components/
    MapView3D.jsx               Extruded geometry, camera rig, 3D route
    MapView2D.jsx               SVG blueprint and pointer gestures
    Searchbar.jsx               Accessible fuzzy-search combobox
    WayfindingPanel.jsx         Endpoint controls, instructions, simulation
    LocationCard.jsx            Room details, share and save actions
  data/questromMapData.js        Room polygons, metadata, corridor graph
  lib/routing.js                Dijkstra, projection, search, interpolation
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

Update room polygons and metadata in the data file. Preserve stable IDs so bookmarks and shared URLs remain valid. Add corridor nodes at junctions, connect bidirectional edges, and keep segments outside solid room interiors. Run `npm test` after edits. Replace the walking-time heuristic only when an actual drawing scale is verified. To add more floors, extend the dataset and connect vertical transportation in the routing graph before enabling more floor choices. A live positioning service would need a real indoor-positioning provider and appropriate user consent; browser GPS alone cannot establish a reliable indoor room-level location.
