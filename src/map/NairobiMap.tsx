import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import {
  SPEED_ATTRIBUTION,
  SPEED_DATA_URL,
  SPEED_SOURCE_ID,
  speedFillLayer,
  type SpeedTileProperties,
} from './speedLayer'

// Nairobi CBD, as [longitude, latitude] (Mapbox puts longitude first).
export const NAIROBI_CENTER: [number, number] = [36.8219, -1.2921]

export function NairobiMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: NAIROBI_CENTER,
      zoom: 11,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      map.addSource(SPEED_SOURCE_ID, {
        type: 'geojson',
        data: SPEED_DATA_URL,
        attribution: SPEED_ATTRIBUTION,
      })
      // Insert below the first label layer so street names stay readable.
      const firstLabel = map.getStyle().layers.find((l) => l.type === 'symbol')?.id
      map.addLayer(speedFillLayer, firstLabel)
    })

    map.on('click', speedFillLayer.id, (event) => {
      const tile = event.features?.[0]?.properties as SpeedTileProperties | undefined
      if (!tile) return
      new mapboxgl.Popup()
        .setLngLat(event.lngLat)
        .setHTML(
          `<strong>${tile.downloadMbps} Mbps</strong> down · ${tile.uploadMbps} Mbps up<br>` +
            `${tile.latencyMs} ms latency · ${tile.tests} ${tile.tests === 1 ? 'test' : 'tests'}`,
        )
        .addTo(map)
    })
    map.on('mouseenter', speedFillLayer.id, () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', speedFillLayer.id, () => (map.getCanvas().style.cursor = ''))

    // Clean up when the component unmounts, so we don't leak WebGL contexts.
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="map"
      role="region"
      aria-label="Map of Nairobi"
    />
  )
}
