# Product

<!-- impeccable:product-schema 1 -->

## Platform

android

One shared Grand Taxi look on Android and, later, iOS. Built for Android first; iOS gets the same brand UI, not a separate native design language.

## Users

All on a phone, often on 4G, sometimes with no network. Passenger and driver carry equal weight in trade-offs.

- **Rabat resident:** needs to know where the taxi to an unfamiliar area leaves from.
- **Student, newcomer:** needs the stand, the price, and the last taxi.
- **Visitor:** needs a clear map (French now, English in phase 2).
- **Older person:** needs big buttons, few screens, Arabic.
- **Driver:** needs to see where each passenger gets off without being asked six times.

## Product Purpose

Grand taxis carry a big share of daily trips in Morocco, and almost none of it is online. The app puts it on the phone: find the right stand, see where it goes, the price per seat and the hours, walk there, pick exactly where to get off on the taxi's route, and pass that point to the driver. The driver sees every drop-off on one map, in route order, with an alert before each stop.

Success (from `docs/SPEC.md` acceptance tests): find the right stand for "Agdal" in under 30 seconds; map and cards work in airplane mode; a passenger's pin reaches the driver in route order in under 5 seconds; the whole app is correct in Arabic; no trip data is left after the trip.

## Positioning

Grand taxi depth that general apps do not have: separate destinations per stand, prices, hours, route lines, a free drop-off anywhere on the line, and a driver mode. Stand data is verified on site by the owner, never copied from another app. It informs and passes a drop-off point; it does not book, hail or price rides.

## Operating Context

- Passenger: standing in the street, one hand, often in sun or a hurry. Then seated in a shared taxi with up to 6 strangers.
- Driver: phone on a holder while driving. Reads the alert at a glance, hears it by voice.
- Trip join: a 4 digit code or QR shown in the taxi.
- Payment: cash to the driver, or card on the driver's own bank Soft POS. The app only stores a `cash` or `card` flag.
- Walking directions: deep link out to Google Maps or Waze.

## Capabilities and Constraints

- Functions F1 to F19 with priorities are in `docs/SPEC.md`. Stack and data model in `docs/ARCHITECTURE.md`.
- Stack: Expo (React Native) + TypeScript, MapLibre with OpenFreeMap tiles, Supabase. MapLibre does not run in Expo Go (dev build needed).
- Offline is a must: stands and routes are bundled and cached.
- French and Arabic with full RTL are a must. English is phase 2.
- No user accounts. A passenger never sees other passengers' drop-offs; the driver sees points, never names or numbers. Trip data is deleted at trip end or after 2 hours.
- Out of scope for V1: booking or hailing, in-app card payment, accounts, petit taxis, bus, tram, public live tracking.
- Terms: "stand" (station de grand taxi), "hub", "drop-off", "ride mode", "driver mode", "trip code".
- Open: final app name and brand ("Grand Taxi Rabat" is a working name).

## Brand Commitments

Binding (confirmed by the owner):

- Colors: green `#0E5A4A` (main), amber `#E8A317` (alerts only), ink `#12201C`, grey text `#5B6B66`, light green `#E6F0ED`, position blue `#2F6FED`. Driver mode is dark: background `#0D1513`, green `#3FA58A`.
- Fonts: Poppins (titles), IBM Plex Sans (text), IBM Plex Sans Arabic.
- 16 px rounded cards, pill buttons, stroke icons, no emoji.
- Main actions at the bottom, reachable with one hand; 3 taps max from opening to "Y aller".
- Uncertain data is shown as uncertain ("non vérifiée", "à confirmer").
- App texts in French and Arabic. No em dashes or en dashes in any copy.

## Evidence on Hand

- `data/stations.geojson`: 6 stands in Rabat, none verified on site yet.
- `docs/mockup/`: 6 screens (home, stand card, passenger ride, report, home in Arabic, driver). Stops, distances and walking times there are examples, not real data.
- `docs/PITCH.md`: market numbers with sources (checked 10 Nov 2026).
- No recorded routes, no testers, no driver pilot, no testimonials yet. Do not invent stops, prices, routes, user counts or quotes; use visible placeholders like `[à vérifier]`.

## Product Principles

1. Truth over coverage: show only data the owner verified, and label everything else as unverified.
2. Street first: every passenger action works one-handed, fast, on a weak or absent network.
3. Two equal languages: Arabic and RTL are first class, never a translation pass.
4. Glance, not read, for the driver: one alert, big, spoken, then out of the way.
5. Privacy by default: no names, no numbers, nothing kept after the trip.

## Accessibility & Inclusion

Older users: big touch targets, few screens, Arabic. Drivers: alerts readable at a glance and read aloud by voice. Full RTL layout in Arabic.
