import type { FilterSpecification, FillLayerSpecification } from 'mapbox-gl'

// One Ookla tile (about 600 m square) as written by scripts/fetch-ookla.mjs.
export type SpeedTileProperties = {
  quadkey: string
  downloadMbps: number
  uploadMbps: number
  latencyMs: number
  tests: number
  devices: number
}

export const SPEED_SOURCE_ID = 'ookla-speed'
export const SPEED_DATA_URL = '/data/ookla-mobile-2026q2.geojson'

// Required by the Ookla open data licence (CC BY-NC-SA 4.0).
export const SPEED_ATTRIBUTION =
  'Speedtest® by Ookla® Global Mobile Network Performance Maps, Q2 2026. ' +
  'Based on analysis by Ookla of Speedtest Intelligence® data. ' +
  'Ookla trademarks used under license and reprinted with permission.'

// Download speed classes, slow to fast. A single-hue ramp stays readable for
// colour-blind users, unlike red-to-green.
export const SPEED_CLASSES = [
  { minMbps: 0, label: 'Under 10 Mbps', color: '#f1eef6' },
  { minMbps: 10, label: '10–25 Mbps', color: '#bdc9e1' },
  { minMbps: 25, label: '25–50 Mbps', color: '#74a9cf' },
  { minMbps: 50, label: '50–100 Mbps', color: '#2b8cbe' },
  { minMbps: 100, label: '100 Mbps and over', color: '#045a8d' },
] as const

export const speedFillLayer: FillLayerSpecification = {
  id: 'ookla-speed-fill',
  type: 'fill',
  source: SPEED_SOURCE_ID,
  paint: {
    'fill-color': [
      'step',
      ['get', 'downloadMbps'],
      SPEED_CLASSES[0].color,
      ...SPEED_CLASSES.slice(1).flatMap((c) => [c.minMbps, c.color]),
    ],
    'fill-opacity': 0.75,
  },
}

// Which SPEED_CLASSES index a tile falls in, as a Mapbox expression.
const speedClassIndex = [
  'step',
  ['get', 'downloadMbps'],
  0,
  ...SPEED_CLASSES.slice(1).flatMap((c, i) => [c.minMbps, i + 1]),
]

// Turns the filter settings into a Mapbox filter for the speed layer.
// Kept as a pure function so it is easy to unit test.
export function buildSpeedFilter(speedClasses: number[], minTests: number): FilterSpecification {
  return [
    'all',
    ['>=', ['get', 'tests'], minTests],
    ['in', speedClassIndex, ['literal', speedClasses]],
  ] as FilterSpecification
}
