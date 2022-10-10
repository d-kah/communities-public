import { useEffect, useRef, useState } from "react"
import L from "leaflet"
import { z } from "zod"
import { MarkersSchema, useMapAddMarker } from "app/core/hooks/useMapAddMarker"

export interface useMapAddMarkersProps {
  map: L.Map | undefined
  markers: z.infer<typeof MarkersSchema>
  markerOptions?: L.MarkerOptions
}

export const useMapAddMarkers = ({ map, markers, markerOptions }: useMapAddMarkersProps) => {
  const { addMarker } = useMapAddMarker({
    map,
    markerOptions,
  })

  useEffect(() => {
    if (!map) return

    markers.forEach((marker, index) => {
      addMarker(marker, index === 0)
    })
  }, [map, markers])
}
