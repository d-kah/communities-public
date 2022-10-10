import Map from "app/core/components/map/Map"
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react"
import L from "leaflet"
import { FormApi } from "final-form"
import { z } from "zod"
import markerImage from "leaflet/dist/images/marker-icon.png"
import { MarkerSchema, useMapAddMarker } from "app/core/hooks/useMapAddMarker"
import { useMapOnMove } from "app/core/hooks/useMapOnMove"
import { useForm } from "react-final-form"

interface CommunityFormMapProps {
  error: ReactNode
}

export default function CommunityFormMap<S extends z.ZodType<any, any>>({
  error,
}: CommunityFormMapProps) {
  const [map, setMap] = useState<L.Map>()
  const form = useForm<FormApi>()
  const { initialValues } = form.getState()
  const marker = MarkerSchema.parse(initialValues)
  // @ts-ignore
  const center = initialValues && new L.LatLng(initialValues.lat, initialValues.lng)

  useMapAddMarker({
    marker,
    map,
    markerOptions: { opacity: 0.5 },
  })

  useMapOnMove(map, () => {
    if (!map || !form.mutators.setLatLng) return

    form.mutators.setLatLng(map.getCenter())
  })

  return (
    <div className="mb-4">
      <div className="relative w-full bg-gray-100 aspect-[4/3] rounded-lg overflow-hidden">
        <Map center={center} setMap={setMap} />
        <img
          src={markerImage.src}
          className="z-[500] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-[20px]"
        />
      </div>

      <div>{error}</div>
    </div>
  )
}
