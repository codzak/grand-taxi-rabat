# Spec (short version)

The full French version is `cahier-des-charges-grand-taxi-rabat.pdf`. This file is the working summary.

## Users

| Who | Wants |
|---|---|
| Rabat resident | Where the taxi to an unfamiliar area leaves from |
| Student, newcomer | The stand, the price, the last taxi |
| Visitor | A clear map, French or English (phase 2) |
| Older person | Big buttons, few screens, Arabic |
| Driver | See where each passenger gets off without being asked 6 times |

Everyone is on a phone, often 4G, sometimes no network.

## Main path (passenger)

1. Open the app, type "Agdal".
2. See the closest stands that go there, with price and hours.
3. "Y aller à pied" opens Google Maps walking directions.
4. In the taxi: open ride mode, tap a known stop or place a pin on the route line.
5. The path to the drop-off is highlighted, with the distance left.
6. Enter the 4-digit code shown in the taxi, choose cash or card, share.
7. An alert shows before the stop.

## Main path (driver)

1. Open driver mode, pick the line. The app creates a trip with a 4-digit code and a QR.
2. Passengers share their drop-offs. They appear on the map as numbered pins, in route order.
3. The path to the next drop-off is highlighted.
4. At 300 m, an alert pops up over the map: place, number of passengers, cash or card. A voice reads it.
5. The drop-off confirms on its own when the taxi stops near the point.
6. End of trip: cash and card totals. All trip data is deleted.

## Functions

| Ref | Function | Detail | Priority |
|---|---|---|---|
| F1 | Stand map | One pin per departure point, clustered when they overlap | Must |
| F2 | Search by destination | Search box and shortcut chips. Other stands turn grey | Must |
| F3 | Stand card | Destinations, price per seat, hours, photo, landmark, last verified date, "not verified" label | Must |
| F4 | Walking directions | Opens Google Maps or Waze in walking mode | Must |
| F5 | Offline | Stands and routes stored on the phone, updated when the network is back | Must |
| F6 | Two languages | French and Arabic, RTL | Must |
| F7 | Report an error | Short form, no account | Must |
| F8 | Back-office | Enter and verify stands and routes, handle reports, export data | Must |
| F9 | Route line | The line drawn on the map with named stops | Should |
| F10 | Ride mode | Passenger position on the line, alert before the stop. Foreground only | Should |
| F11 | Free drop-off | Known stop or a pin snapped to the route line. Path to it shown at once, with distance left, for passenger and driver | Should |
| F12 | Tell the driver | 4-digit code or QR. The drop-off goes to the driver's phone, no name, no number | Should |
| F13 | Driver mode | Full-screen map, numbered drop-off pins, highlighted path to the next one, pop-up alert at 300 m, voice, auto-confirm | Should |
| F14 | Payment flag | Passenger picks cash or card when sharing. Driver sees it per passenger and the totals | Should |
| F15 | In-app card payment | Through a licensed Moroccan provider | Phase 2 |
| F16 | Favourites | Saved on the phone | Should |
| F17 | Salé, Témara, other cities | Same app, new data | Phase 2 |
| F18 | Seats left | "2 seats left", from drivers or passengers | Phase 2 |
| F19 | English | Third language | Phase 2 |

## Report form (F7)

| Field | Type | Rule | Required |
|---|---|---|---|
| Station | Hidden | Id of the stand on screen | Yes |
| Error type | Single choice | Stand gone, wrong place, wrong destination, wrong price or hours, other | Yes |
| Detail | Text | 300 characters max, plain text | No |
| My position | Checkbox | Sent once, rounded, never tied to an identity | No |

States: empty, error (no type chosen), sending, success, offline (queued on the phone, sent later), server failure (retry, then message).

## Payment

The price is the usual price per seat. The app shows it, it does not set it.

| Mode | How | When |
|---|---|---|
| Cash | Paid to the driver. The app only stores the flag `cash` | V1 |
| Card on the driver's phone | Driver uses his bank's Soft POS (CMI "Tap to mobile", Attijari "Sahl Pay"). The app never sees the card | V1, if the driver has it |
| Card in the app | Needs a Moroccan company and a licensed provider (CMI through the bank, or an aggregator like PayZone). Stripe does not open accounts for Moroccan companies | Phase 2 |

## Trip data rules

| Data | Rule |
|---|---|
| Trip code | 4 digits, one trip only, expires after 2 hours |
| Passenger drop-off | A point on the line. No name, no number. Deleted at trip end |
| Taxi position | Read on the driver's phone during the trip only. Never stored |
| Passengers on board | Counted from shared drop-offs, max 6 |

## Out of scope for V1

- Booking or hailing a taxi (no legal framework for transport apps in Morocco today)
- In-app card payment
- User accounts
- Petit taxis, buses, tram
- Public live tracking of taxis

## Design

- Colors: green `#0E5A4A` (main), amber `#E8A317` (alerts only), ink `#12201C`, grey text `#5B6B66`, light green `#E6F0ED`, position blue `#2F6FED`. Driver mode is dark: background `#0D1513`, green `#3FA58A`.
- Fonts: Poppins (titles), IBM Plex Sans (text), IBM Plex Sans Arabic.
- 16 px rounded cards, pill buttons, stroke icons, no emoji.
- One hand, standing in the street: main actions at the bottom, 3 taps max from opening to "Y aller".
- Uncertain data is shown as uncertain ("non vérifiée", "à confirmer").

## Acceptance tests

- Search "Agdal" and find the right stand in under 30 seconds.
- "Y aller à pied" opens the right destination in Google Maps.
- In airplane mode, map and cards still work.
- A pin placed by the passenger shows in the right order on the driver's phone in under 5 seconds.
- The driver alert pops up over the map before the point, with the payment mode.
- After the trip, no drop-off or position is left in the database.
- The whole app is correct in Arabic.
