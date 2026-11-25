# Mockup screens

The 6 screens of the mockup, exported as source files. The live, clickable version is the "Grand Taxi Rabat, maquette app" online canvas (private until shared).

These `.dc.html` files do not run in a normal browser (they need the canvas runtime). Read them as a reference for layout, sizes, colors, icons (inline SVG) and the French and Arabic texts. The logic at the bottom of each file (`renderVals`) shows the intended behavior.

| File | Screen |
|---|---|
| `1-home.dc.html` | Map, search by destination, nearby stands |
| `2-station.dc.html` | Stand card: destinations, prices, "Y aller à pied", "Voir le trajet" |
| `3-ride-passenger.dc.html` | Ride mode: known stop or free pin on the line, highlighted path, share with driver, cash or card |
| `4-report.dc.html` | Report an error, all states |
| `5-home-arabic.dc.html` | Home in Arabic, RTL |
| `6-driver.dc.html` | Driver mode: full map, numbered drop-off pins, pop-up alert, totals |
| `7-ride-passenger-arabic.dc.html` | Ride mode in Arabic, RTL (built from `3-ride-passenger`, same logic) |
| `8-driver-arabic.dc.html` | Driver mode in Arabic, RTL (built from `6-driver`, same logic) |
| `9-station-arabic.dc.html` | Stand card in Arabic, RTL (built from `2-station`, same logic) |
| `10-report-arabic.dc.html` | Report an error in Arabic, RTL, all states (built from `4-report`, same logic) |

Stops, distances and walking times in the mockup are examples, not real data.

To rebuild an Arabic screen after changing its French source: `node to-arabic.js <french file> <arabic file>`. Add any new French text to the table in `to-arabic.js` first; the script stops if a text is missing.
