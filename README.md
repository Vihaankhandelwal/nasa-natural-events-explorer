# EarthPulse

EarthPulse is a browser-based NASA natural events dashboard. It uses the NASA Earth Observatory Natural Event Tracker (EONET) v3 API to map recent wildfires, storms, volcanoes, floods, ice events, and other natural events around the world.

## What It Demonstrates

- Fetching and transforming live API data
- Working with GeoJSON-style coordinates
- Building an interactive map with Leaflet
- Drawing a lightweight local reference map instead of depending on map tiles
- Filtering, searching, and rendering app state in vanilla JavaScript
- Writing a clean, responsive frontend without a build step

## Tech Stack

- HTML
- CSS
- JavaScript
- Leaflet
- NASA EONET v3 API

## Run Locally

Open this folder in VS Code:

```bash
code .
```

Then run a tiny local server:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

You can also open `index.html` directly in a browser, but the local server is closer to how GitHub Pages will serve it.

## Push To GitHub

This folder is already initialized as a Git repo on the `main` branch, and `origin` points to `https://github.com/Vihaankhandelwal/nasa-natural-events-explorer.git`.

From inside this project folder:

```bash
git config user.name "Vihaankhandelwal"
git config user.email "your-github-email@example.com"
git add .
git commit -m "Build NASA natural events explorer"
git push -u origin main
```

If the remote ever needs to be fixed, run:

```bash
git remote set-url origin https://github.com/Vihaankhandelwal/nasa-natural-events-explorer.git
```

## Deploy With GitHub Pages

1. Go to the repo on GitHub.
2. Open **Settings**.
3. Open **Pages**.
4. Set source to **Deploy from a branch**.
5. Select the `main` branch and `/root`.
6. Save.

## Data Source

NASA EONET v3 documentation: https://eonet.gsfc.nasa.gov/docs/v3

The app requests:

```text
https://eonet.gsfc.nasa.gov/api/v3/events
```

## Portfolio Talking Points

- I used NASA's near-real-time EONET API and transformed each event's latest geometry into mapped event markers.
- I built client-side filters for event category, event status, date window, result limit, and search.
- I handled API failure with sample data so the UI still remains testable.
- I kept the project dependency-light so it can run on GitHub Pages without a backend.

## Stretch Ideas

- Add a timeline slider for event movement.
- Add country or region filters using bounding boxes.
- Add NASA Worldview imagery links for each event category.
- Add a CSV export button for the current filtered event list.
- Add a small automated test suite for the data transformation helpers.
