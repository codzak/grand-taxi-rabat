# AGENTS.md

A guide for AI coding agents and human contributors working on this repo.

**Grand Taxi Rabat** is a map of grand taxi stands in Rabat that shows where each stand is and where it goes. Later it will show the route each taxi follows and help passengers during the ride. It is a learning project: the owner (Zakaria, GitHub `codzak`) writes the code, and agents teach and review.

## Naming

- In user-facing text the app is called **Grand Taxi Rabat**.
- Folders, files and ids are lowercase with hyphens: `grand-taxi-rabat`, `minipark-agdal`.
- Station ids follow the pattern `<hub>-<main-destination>`.

## 1. Repo map

| Path | What it is |
|---|---|
| `index.html` | The whole web app for now: Leaflet 1.9.4 map, OpenStreetMap tiles, plain JavaScript |
| `stations.geojson` | Stand data, one Point feature per stand |
| `routes.geojson` | (planned) Route LineStrings |
| `AGENTS.md` | This file |

No build step, no framework, no npm. Keep it that way until the owner decides otherwise.

## 2. Golden rules

### Teach first

- Don't write features for the owner unless he asks for the full solution. Explain, hint, and review. Small snippets are fine when he's stuck.
- Explain every change you make in plain words: what it does and why.
- Never use em dashes in code comments, docs or messages.

### Data integrity

- **Never copy data from Blasty** or any other app. Their data is only a checklist of places to visit in person.
- Allowed sources: the owner's field visits, notes he gives you, OpenStreetMap (ODbL, credit it).
- GeoJSON coordinates are `[lng, lat]`. Leaflet and Google Maps use `[lat, lng]`. Check every conversion.
- Every stand must have: `id` (unique), `hub`, `destinations` (non-empty array), `price_dh` (number), `hours` (`day` or `day_night`), `notes` (string), `verified` (boolean).
- Never set `verified: true` yourself. Only the owner does that after checking the stand in person.
- Rabat-area points must fall inside the bbox `33.88,-6.95,34.10,-6.72` (south, west, north, east). Anything outside it is probably swapped lat/lng.
- Never delete a stand. If one stops existing, add a note and let the owner decide.

### Code

- Plain HTML, CSS and JavaScript. Load libraries only from unpkg or cdnjs, with a pinned version.
- No API keys in the repo. Google Maps is used only through deep links (`https://www.google.com/maps/dir/?api=1&...`), which need no key.
- Keep the map attribution: `© OpenStreetMap contributors`.
- Must work on a phone screen. Passengers will use it standing at a taxi stand.
- Don't collect or store user location. `watchPosition` (in-ride mode) stays in the browser only.

## 3. Before finishing

Run these from the repo root:

```
python -m json.tool stations.geojson > NUL
python -m http.server
```

1. The JSON check prints nothing (on macOS or Linux, use `/dev/null` instead of `NUL`).
2. Open http://localhost:8000. Every pin shows up in Rabat, every popup opens, and the browser console has no errors.
3. Check it at phone width in the browser dev tools.
4. Write a short commit message that says what changed and why.

## 4. Deploying (planned)

- Hosted on GitHub Pages from the `main` branch of `codzak/grand-taxi-rabat`.
- Nothing is published until the owner turns Pages on.

## 5. Several agents at once

- Work only on the files your task needs.
- Don't touch another agent's in-progress changes, and don't "fix" them.
- `stations.geojson` must be valid JSON after every edit, because a broken file breaks the whole map.
