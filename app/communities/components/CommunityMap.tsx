import Map from "app/core/components/map/Map"
import { z } from "zod"
import { CommunitySchema } from "app/communities/validations"
import { useMapAddMarker } from "app/core/hooks/useMapAddMarker"
import L from "leaflet"
import { useState } from "react"

interface CommunityMapProps {
  community: z.infer<typeof CommunitySchema>
}

export default function CommunityMap({ community }: CommunityMapProps) {
  const [map, setMap] = useState<L.Map>()
  useMapAddMarker({ map, marker: community })

  return (
    <div className="mb-4">
      <div className="relative w-full bg-gray-100 aspect-[4/3] rounded-lg overflow-hidden">
        <Map setMap={setMap} />
      </div>
    </div>
  )
}
