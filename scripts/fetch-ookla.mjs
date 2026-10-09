// Extracts Nairobi tiles from Ookla's open Speedtest data into a small GeoJSON file.
// The source Parquet file is sorted by quadkey, so we only read the row groups
// that can contain Nairobi tiles, over HTTP range requests.
//
// Usage: node scripts/fetch-ookla.mjs [mobile|fixed] [year] [quarter]

import { writeFile, mkdir } from 'node:fs/promises'
import { asyncBufferFromUrl, parquetMetadataAsync, parquetReadObjects } from 'hyparquet'

const [type = 'mobile', year = '2026', quarter = '2'] = process.argv.slice(2)
const month = String((Number(quarter) - 1) * 3 + 1).padStart(2, '0')
const url = `https://ookla-open-data.s3.amazonaws.com/parquet/performance/type=${type}/year=${year}/quarter=${quarter}/${year}-${month}-01_performance_${type}_tiles.parquet`

// Roughly Nairobi County: [west, south, east, north].
const BBOX = [36.66, -1.45, 37.11, -1.16]
const ZOOM = 16

const lonToX = (lon) => Math.floor(((lon + 180) / 360) * 2 ** ZOOM)
const latToY = (lat) => {
  const r = (lat * Math.PI) / 180
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** ZOOM)
}
const xToLon = (x) => (x / 2 ** ZOOM) * 360 - 180
const yToLat = (y) => (Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / 2 ** ZOOM))) * 180) / Math.PI

function toQuadkey(x, y) {
  let key = ''
  for (let z = ZOOM; z > 0; z--) {
    const mask = 1 << (z - 1)
    key += ((x & mask) ? 1 : 0) + ((y & mask) ? 2 : 0)
  }
  return key
}

// Every zoom-16 tile inside the bounding box.
const wanted = new Map()
for (let x = lonToX(BBOX[0]); x <= lonToX(BBOX[2]); x++) {
  for (let y = latToY(BBOX[3]); y <= latToY(BBOX[1]); y++) {
    wanted.set(toQuadkey(x, y), [x, y])
  }
}
const keys = [...wanted.keys()].sort()
const [minKey, maxKey] = [keys[0], keys.at(-1)]

const file = await asyncBufferFromUrl({ url })
const metadata = await parquetMetadataAsync(file)
const columns = ['quadkey', 'avg_d_kbps', 'avg_u_kbps', 'avg_lat_ms', 'tests', 'devices']

const features = []
let rowStart = 0
for (const group of metadata.row_groups) {
  const rowEnd = rowStart + Number(group.num_rows)
  const stats = group.columns.find((c) => c.meta_data.path_in_schema[0] === 'quadkey').meta_data.statistics
  if (stats.max_value >= minKey && stats.min_value <= maxKey) {
    console.log(`Reading rows ${rowStart}-${rowEnd}...`)
    const rows = await parquetReadObjects({ file, metadata, columns, rowStart, rowEnd })
    for (const row of rows) {
      const tile = wanted.get(row.quadkey)
      if (!tile) continue
      const [x, y] = tile
      const [w, n, e, s] = [xToLon(x), yToLat(y), xToLon(x + 1), yToLat(y + 1)].map((v) => +v.toFixed(6))
      features.push({
        type: 'Feature',
        properties: {
          quadkey: row.quadkey,
          downloadMbps: +(Number(row.avg_d_kbps) / 1000).toFixed(1),
          uploadMbps: +(Number(row.avg_u_kbps) / 1000).toFixed(1),
          latencyMs: Number(row.avg_lat_ms),
          tests: Number(row.tests),
          devices: Number(row.devices),
        },
        geometry: { type: 'Polygon', coordinates: [[[w, n], [e, n], [e, s], [w, s], [w, n]]] },
      })
    }
  }
  rowStart = rowEnd
}

const out = `public/data/ookla-${type}-${year}q${quarter}.geojson`
await mkdir('public/data', { recursive: true })
await writeFile(out, JSON.stringify({ type: 'FeatureCollection', features }))
console.log(`Wrote ${features.length} tiles to ${out}`)
