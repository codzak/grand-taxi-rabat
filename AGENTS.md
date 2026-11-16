# AGENTS.md

A guide for AI coding agents and human contributors.

**Grand Taxi Rabat** is a mobile app for grand taxis in Rabat: find the stand, see destinations and prices, pick a free drop-off point on the taxi's route, share it with the driver, who sees all drop-offs on a map with alerts. It is a learning project: the owner (Zakaria, GitHub `codzak`) writes the features, agents teach and review. The spec is in `docs/`.

## Naming

- User-facing name: **Grand Taxi Rabat** (working name, not final).
- Folders, files and ids: lowercase with hyphens (`grand-taxi-rabat`, `minipark-agdal`).
- Station ids: `<hub>-<main-destination>`.
- Code and comments in English. App texts in French and Arabic.

## 1. Repo map

| Path | What it is |
|---|---|
| `app/` | Expo (React Native, TypeScript) app. Created in Step 0 of the roadmap |
| `data/stations.geojson` | Stand data, one Point feature per stand |
| `data/routes.geojson` | (planned) Route LineStrings |
| `supabase/` | (planned) SQL migrations and Edge Functions |
| `prototype/index.html` | Old Leaflet web prototype, kept as a sandbox |
| `docs/` | Spec, architecture, pitch notes, mockup screens, PDF |

## 2. Golden rules

### Teach first

- Do setup and boilerplate yourself, and say in one line what each step is for.
- Don't write features for the owner unless he asks for the full solution. Hint, explain, review.
- Explain every change you make in plain words: what it does and why and make it easy to understand and simple.
- if the user still doesn't understand use a british gang affiliated hood accent to explain it in very simple terms you feel me fam LITERALLY TALK LIKE "central cee"
- Never state a limit, price, API or legal rule without checking it. If unchecked, say so.
- Never use em dashes or en dashes in code comments, docs or messages.

### Data integrity

- **Never copy data from Blassty** or any other app. Their data is only a checklist of places to visit.
- Allowed sources: the owner's field visits, notes he gives you, OpenStreetMap (ODbL, credit it).
- GeoJSON is `[lng, lat]`. MapLibre also uses `[lng, lat]`. Leaflet and Google Maps URLs use `lat,lng`. Check every conversion.
- Every stand has: `id` (unique), `hub`, `destinations` (non-empty array), `price_dh` (number), `hours` (`day` or `day_night`), `notes` (string), `verified` (boolean).
- Never set `verified: true` yourself. Only the owner does, after a visit.
- Rabat-area points must be inside the bbox `33.88,-6.95,34.10,-6.72` (south, west, north, east).
- Never delete a stand. Add a note and let the owner decide.
- Never invent stops, prices or routes. Use visible placeholders like `[à vérifier]`.

### Scope (legal)

- The app gives information and passes a drop-off point to a driver who already has the passenger on board. It does **not** book rides, find customers, or set prices. Don't add any of that without the owner's say.
- V1 payment is only a flag (`cash` or `card`). No card data ever enters the app or the database. In-app card payment is phase 2 and needs a licensed Moroccan provider.

### Security

- No secrets in the repo or in the app bundle. `.env` is git-ignored, `.env.example` lists names only.
- The only key in the app is the Supabase **anon** key. The **service role** key lives only in Edge Function secrets.
- Row Level Security on every table. The public reads nothing directly from the database.
- Validate every Edge Function input against a strict schema (Zod). Reject unknown fields.
- Rate limit every public function (reports, join trip, share drop-off). Limit code guesses per device.
- A passenger never sees other passengers' drop-offs. The driver sees points, never names or phone numbers.
- Trip data (drop-offs, positions, code) is deleted at trip end or after 2 hours.
- Location: foreground only. Don't request background location (Google Play review, and not needed).
- Generic error messages to users, details to Sentry only.
- Remind the owner about 2FA on GitHub, Expo, Supabase, the store accounts and the domain.

### App

- Must run well on a cheap Android phone and work offline for stands and routes.
- Touch targets at least 44 px, contrast at least 4.5:1, screen reader labels on icon buttons.
- French and Arabic, full RTL in Arabic. Phone numbers and codes stay left to right.
- Driver mode: built for a phone on a holder. No typing while driving, big text, voice announcement, drop-offs confirm on their own.
- Keep the map attribution (OpenStreetMap, OpenFreeMap).

## 3. Before finishing

1. `data/*.geojson` is valid JSON: `python -m json.tool data/stations.geojson > NUL` (use `/dev/null` on macOS or Linux).
2. In `app/`: `npx tsc --noEmit` and `npx expo lint` pass (once the app exists).
3. The changed screen was opened on a device or emulator, in French and in Arabic.
4. No secret in the diff: `git diff --cached | findstr /i "service_role secret password"` prints nothing.
5. Short commit message: what changed and why.

## 4. Pre-launch checklist

Mark each Done, N/A or To do before any store release.

1. No secret key in the app or in git
2. Any key ever committed is rotated
3. Rate limiting on
4. Access checked on the server
5. RLS: the public reads nothing
6. Inputs validated on the server
7. Spending alerts on paid services
8. Errors don't leak details
9. Sentry set up
10. Database backup, and a restore tested
11. "Not found" and "error" screens in FR and AR
12. Tested on a cheap Android
13. App opens in under 3 seconds
14. Store listing and share image
15. Privacy policy, legal notice, CNDP declaration (law 09-08)
16. Usage stats without ad tracking
17. Report and share-drop-off flows tested end to end, offline included
18. SPF, DKIM, DMARC: N/A unless the app sends email
19. A way to contact the team
20. Rollback plan (previous build, previous JSON data)

## 5. Several agents at once

- Work only on the files your task needs.
- Don't touch or "fix" another agent's in-progress changes.
- `data/*.geojson` and `app/package.json` must be valid after every edit.
