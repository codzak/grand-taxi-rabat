# Architecture

Prices and limits below were checked on 10 Nov 2026. Check them again before relying on them.

## Where the map comes from

The map on screen is 3 layers stacked on top of each other:

| Layer | Source | Cost |
|---|---|---|
| 1. Background (streets, names, parks) | **OpenFreeMap** vector tiles, built from OpenStreetMap data. Style URL: `https://tiles.openfreemap.org/styles/liberty` | Free, no API key, no view limit. Attribution required |
| 2. Stands (pins) | Our own file `data/stations.geojson`, collected on site | Ours |
| 3. Taxi routes (lines) | Our own GPS traces from real rides, snapped to roads with OSRM, saved in `data/routes.geojson` | Ours |

**MapLibre** is the library that draws all 3 in the app. It is not a map, it is the engine that renders one.

Walking directions to a stand are not drawn by us: a deep link opens Google Maps or Waze (`https://www.google.com/maps/dir/?api=1&destination=LAT,LNG&travelmode=walking`).

If OpenFreeMap ever goes down or limits us, the fallbacks are MapTiler or Stadia (free tiers with a key), or hosting our own tiles for Morocco (Protomaps). Only the style URL changes.

## Stack

| Layer | Choice | Why |
|---|---|---|
| App | Expo (React Native) + TypeScript | One codebase for Android and iOS. iOS builds run in the cloud, no Mac needed |
| Map | MapLibre React Native + OpenFreeMap | Free, no key. Needs an Expo development build, not Expo Go |
| Public data | `stations.json`, `routes.json`, versioned, on a CDN, plus a copy in the app | Works offline, costs nothing per user |
| Backend | Supabase (Postgres + PostGIS), EU region | Database, team login and row rules ready. Free: 500 MB, 500k function calls a month. Free projects pause after 1 week without activity |
| Reports, trips | Supabase Edge Functions | Secret key stays on the server, rate limits |
| Live drop-offs | Supabase Realtime | Free: 200 connections at once, 2 million messages a month |
| Route geometry | GPX from a real ride, snapped with OSRM `match` | Computed once by the team. No paid routing call per user |
| Walking directions | Deep link to Google Maps or Waze | Free |
| Builds | EAS Build | Free: 15 Android and 15 iOS builds a month |
| Errors | Sentry | |

### Why not

- **Google Maps SDK + Navigation**: the mobile map is free, but Routes has 10k free calls a month and Navigation 1k, then 25 $ per 1,000.
- **Flutter**: a second language to learn.
- **Separate Kotlin and Swift apps**: two codebases.
- **Custom backend**: Supabase covers V1.

## Who calls what

```
                 OpenFreeMap tiles      JSON on CDN        Google Maps / Waze
                        ^                   ^                     ^
                        | reads             | downloads           | opens (deep link)
                        +---------- App (passenger) -------------+
                                        |
                                        | report, join trip, share drop-off
                                        v
   Back-office (team, 2FA) --> Supabase Postgres <-- Edge Functions (service key here)
            |                        |                     |
            | GPX traces             | export JSON         | drop-offs
            v                        v                     v
          OSRM                     CDN                 Realtime --> App (driver mode)
```

Public, no personal data: tiles, JSON, deep links. Private: database, functions, realtime, back-office.

## Data model

### Public files

`stations.geojson`, one Point per stand:

```json
{
  "id": "minipark-agdal",
  "hub": "Mini Park, Youssoufia",
  "destinations": ["Agdal", "Masjid Badr"],
  "price_dh": 5,
  "hours": "day_night",
  "notes": "",
  "verified": false
}
```

`routes.geojson`, one LineString per line (planned):

```json
{
  "id": "minipark-agdal",
  "from_station": "minipark-agdal",
  "to": "Agdal",
  "price_dh": 5,
  "stops": [{ "name": "Avenue Al Massira", "at": 0.25 }]
}
```

`at` is the position of the stop along the line, from 0 (start) to 1 (end). A free drop-off uses the same idea: one number between 0 and 1. That is what "snapped to the line" means, and it makes sorting drop-offs in route order trivial.

### Database tables (draft, to refine in Step 3 and Step 5)

| Table | Columns | Notes |
|---|---|---|
| `stations` | id, hub, geom (Point), destinations, price_dh, hours, notes, verified, verified_at | Source of truth, exported to JSON |
| `routes` | id, from_station, to_name, geom (LineString), price_dh, stops (jsonb) | Exported to JSON |
| `reports` | id, station_id, type, detail, geom (nullable), created_at, status | Insert only through the Edge Function |
| `trips` | id, route_id, code, status, created_at, expires_at | Created by driver mode. Code is 4 digits, unique among open trips |
| `dropoffs` | id, trip_id, at (0 to 1), label, pay (`cash` or `card`), seats, done | No identity. Deleted with the trip |

Coordinates: GeoJSON and MapLibre use `[lng, lat]`. Google Maps URLs use `lat,lng`.

## Security rules (summary, full list in AGENTS.md)

- Anon key in the app, service role key only in Edge Function secrets.
- RLS on every table. No direct public read.
- Zod schema on every function input.
- Rate limits: reports per device per hour, code attempts per device.
- A passenger gets back only their own drop-off. The driver channel is tied to the trip id, which only the driver's device holds.
- Trips, drop-offs and codes deleted at trip end or after 2 hours (scheduled function).
- Location in the foreground only.

## Legal points (not settled, see docs/PITCH.md "to validate")

- Law 09-08 / CNDP: a drop-off point and a report position are personal location data. Privacy policy, legal notice, CNDP declaration.
- Hosting the database in Europe is a transfer outside Morocco under law 09-08.
- Phone at the wheel: holding it is banned, hands-free is allowed. A phone on a holder: to confirm with NARSA.
- Transport apps have no legal framework in Morocco. The app stays on information and on-board drop-off, no booking, no pricing.
- OpenStreetMap data is ODbL: credit it. Our stand data stays a separate database.

## Store facts

- Google Play: 25 $ once. New personal accounts need 12 testers for 14 days before production.
- Apple: 99 $ a year. A privacy policy link is required.
- Background location needs a form, a video and a review on Google Play. We don't use it.
