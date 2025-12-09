import React, { useEffect, useRef, useState } from 'react'
import mapboxgl, { Map as MapboxMap, GeoJSONSource } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { fetchRiskZones, type RiskZone } from '../../../services/safetyApi'

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

const DEFAULT_CENTER: [number, number] = [78.9629, 22.5937] // India approx

interface SafetyGlobeMapProps {
  jumpToMyLocationKey?: number
}

const SafetyGlobeMap: React.FC<SafetyGlobeMapProps> = ({ jumpToMyLocationKey }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const markerRef = useRef<mapboxgl.Marker | null>(null)
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null) // [lng, lat]

  // 1. Initialise bare Mapbox globe and place a single marker from geolocation
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let isMounted = true

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: DEFAULT_CENTER,
      zoom: 4,
      projection: 'globe'
    })

    mapRef.current = map

    map.on('style.load', () => {
      if (!isMounted) return

      map.setFog({
        range: [0.8, 8],
        color: 'rgba(11,15,25,0.9)',
        'horizon-blend': 0.2
      })

      // Once style is ready, load and render risk zones
      ;(async () => {
        try {
          const zones: RiskZone[] = await fetchRiskZones()
          if (!isMounted || !mapRef.current) return

          const features = zones
            .filter((z) => z.geom?.bbox && Array.isArray(z.geom.bbox) && z.geom.bbox.length === 4)
            .map((zone) => {
              const bbox = zone.geom.bbox as [number, number, number, number]
              const [minLng, minLat, maxLng, maxLat] = bbox
              const coordinates = [
                [minLng, minLat],
                [maxLng, minLat],
                [maxLng, maxLat],
                [minLng, maxLat],
                [minLng, minLat]
              ]

              return {
                type: 'Feature',
                properties: {
                  id: zone.id,
                  name: zone.name,
                  description: zone.description,
                  risk_level: zone.risk_level
                },
                geometry: {
                  type: 'Polygon',
                  coordinates: [coordinates]
                }
              }
            }) as any[]

          const collection = {
            type: 'FeatureCollection',
            features
          } as const

          const currentMap = mapRef.current
          if (!currentMap) return

          const existingSource = currentMap.getSource('risk-zones') as GeoJSONSource | undefined

          if (!existingSource) {
            currentMap.addSource('risk-zones', {
              type: 'geojson',
              data: collection
            })

            currentMap.addLayer({
              id: 'risk-zones-fill',
              type: 'fill',
              source: 'risk-zones',
              paint: {
                'fill-color': [
                  'match',
                  ['downcase', ['get', 'risk_level']],
                  'high', '#dc2626',
                  'critical', '#b91c1c',
                  'medium', '#f97316',
                  /* other */ '#16a34a'
                ],
                'fill-opacity': 0.28
              }
            })

            currentMap.addLayer({
              id: 'risk-zones-outline',
              type: 'line',
              source: 'risk-zones',
              paint: {
                'line-color': [
                  'match',
                  ['downcase', ['get', 'risk_level']],
                  'high', '#ef4444',
                  'critical', '#fecaca',
                  'medium', '#fdba74',
                  /* other */ '#4ade80'
                ],
                'line-width': 1.2
              }
            })
          } else {
            existingSource.setData(collection as any)
          }
        } catch (e) {
          console.error('Failed to load risk zones for globe map', e)
        }
      })()
    })

    let watchId: number | null = null

    if (navigator.geolocation) {
      let hasCentered = false
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          if (!isMounted || !mapRef.current) return

          const lngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude]
          setUserLocation(lngLat)

          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
              .setLngLat(lngLat)
              .addTo(mapRef.current)
          } else {
            markerRef.current.setLngLat(lngLat)
          }

          if (!hasCentered) {
            hasCentered = true
            mapRef.current.flyTo({ center: lngLat, zoom: 13, essential: true })
          }
        },
        (err) => {
          console.error('Globe geolocation error', err)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 20000
        }
      )
    }

    return () => {
      isMounted = false
      if (watchId !== null) navigator.geolocation.clearWatch(watchId)
      markerRef.current?.remove()
      map.remove()
      mapRef.current = null
    }
  }, [])

  // 2. Jump-to-location button
  // - If we already have a userLocation, just fly there (previous behavior).
  // - If we don't yet have a userLocation, actively request it once via
  //   getCurrentPosition so the browser can show the permission dialog.
  useEffect(() => {
    if (jumpToMyLocationKey === undefined) return

    // Case 1: we already know the user's location – keep original behavior.
    if (mapRef.current && userLocation) {
      mapRef.current.flyTo({ center: userLocation, zoom: 12, essential: true })
      return
    }

    // Case 2: no known location yet – try a one-off geolocation request.
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lngLat: [number, number] = [pos.coords.longitude, pos.coords.latitude]
        setUserLocation(lngLat)

        if (mapRef.current) {
          mapRef.current.flyTo({ center: lngLat, zoom: 12, essential: true })
        }

        // Ensure the same style of blue marker appears even if location
        // is first obtained via this jump call instead of the watcher.
        if (mapRef.current) {
          if (!markerRef.current) {
            markerRef.current = new mapboxgl.Marker({ color: '#2563eb' })
              .setLngLat(lngLat)
              .addTo(mapRef.current)
          } else {
            markerRef.current.setLngLat(lngLat)
          }
        }
      },
      (err) => {
        // If the user denies or blocks location, we just log; no other
        // behavior changes and the map stays as-is.
        console.error('Jump-to-location geolocation error', err)
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000
      }
    )
  }, [jumpToMyLocationKey, userLocation])

  return <div ref={containerRef} className="w-full h-full" />
}

export default SafetyGlobeMap
