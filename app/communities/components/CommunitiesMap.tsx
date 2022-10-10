import { useState } from "react"
import L from "leaflet"
import markerImage from "leaflet/dist/images/marker-icon.png"
import Map from "app/core/components/map/Map"
import { CommunitiesSchema } from "app/communities/validations"
import { z } from "zod"
import { useMapAddMarkers } from "app/core/hooks/useMapAddMarkers"

export interface CommunitiesMapProps {
  communities: z.infer<typeof CommunitiesSchema>
}

export const icon = new L.Icon({
  iconUrl: markerImage.src,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

export const tooltip = {
  offset: new L.Point(0, -42),
  opacity: 1,
  direction: "top",
}

const CommunitiesMap = ({ communities }: CommunitiesMapProps) => {
  const [map, setMap] = useState<L.Map>()
  useMapAddMarkers({ map, markers: communities })

  return <Map center={new L.LatLng(51.505, -0.09)} setMap={setMap} />
}

export default CommunitiesMap
