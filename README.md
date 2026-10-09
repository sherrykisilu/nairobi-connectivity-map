# Nairobi Connectivity Map

An interactive map of mobile internet speeds across Nairobi, built from
[Ookla's open Speedtest data](https://github.com/teamookla/ookla-open-data).
Matatu routes are coming next, to show connectivity along commuter routes.

**Stack:** React 19, TypeScript (strict), Vite, Redux Toolkit, MUI, Mapbox GL JS.

## Features

- Ookla tiles for Nairobi, coloured by average download speed.
- Filters for speed class and minimum tests per tile, held in a Redux slice and
  applied to the map with Mapbox filter expressions.
- Click a tile for download, upload, latency and test count.
- The filter panel doubles as the legend and works with keyboard and screen readers.

## How the data is prepared

Ookla publishes each quarter as a ~185 MB Parquet file sorted by
[quadkey](https://learn.microsoft.com/en-us/bingmaps/articles/bing-maps-tile-system).
[`scripts/fetch-ookla.mjs`](scripts/fetch-ookla.mjs) works out which zoom-16
quadkeys cover Nairobi, uses the row-group statistics to find the one row group
that can contain them, and reads only that row group and the needed columns over
HTTP range requests. The result is a 400 KB GeoJSON file with about 1,400 tiles.

```bash
node scripts/fetch-ookla.mjs mobile 2026 2
```

## Run it

```bash
npm install
cp .env.example .env.local   # then add your public Mapbox token
npm run dev
```

## Data licence

Speedtest® by Ookla® Global Fixed and Mobile Network Performance Maps. Based on
analysis by Ookla of Speedtest Intelligence® data for Q2 2026. Provided by Ookla
and accessed 9 October 2026. Ookla trademarks used under license and reprinted
with permission. The data in `public/data/` is licensed under
[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/).
