import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import { z } from "zod"
import { CommunitySchema } from "app/communities/validations"
import { icon, tooltip } from "app/communities/components/CommunitiesMap"

export const MarkerSchema = CommunitySchema.pick({
  name: true,
  lat: true,
  lng: true,
})
  .partial()
  .optional()

export const MarkersSchema = MarkerSchema.array()

export interface useMapAddMarkerProps {
  map: L.Map | undefined
  marker?: z.infer<typeof MarkerSchema>
  markerOptions?: L.MarkerOptions
}

export const useMapAddMarker = ({ map, marker, markerOptions }: useMapAddMarkerProps) => {
  const featureGroup = useRef(L.featureGroup()).current

  const createMarker = (markerArg: z.infer<typeof MarkerSchema>) => {
    const marker = L.marker(new L.LatLng(markerArg?.lat!, markerArg?.lng!), {
      icon,
      ...markerOptions,
    })

    // @ts-ignore https://github.com/DefinitelyTyped/DefinitelyTyped/issues/30030
    if (markerArg.name) marker.bindTooltip(markerArg.name, tooltip)

    return marker
  }

  const addMarker = (markerArg: z.infer<typeof MarkerSchema>, clearAllMarkers = true) => {
    if (clearAllMarkers) featureGroup.clearLayers()

    const marker = createMarker(markerArg)

    featureGroup.addLayer(marker)

    map?.fitBounds(featureGroup.getBounds(), { maxZoom: 13 })
  }

  useEffect(() => {
    if (!map) return
    if (!map.hasLayer(featureGroup)) featureGroup.addTo(map)

    featureGroup.clearLayers()

    if (marker?.lat && marker?.lng) addMarker(marker)

    return () => {
      map.removeLayer(featureGroup)
    }
  }, [map, marker])

  return {
    addMarker,
  }
}
