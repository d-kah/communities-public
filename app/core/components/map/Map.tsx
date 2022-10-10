import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Dispatch, ReactNode, SetStateAction, useEffect, useMemo } from "react"
import { MapContainer, TileLayer } from "react-leaflet"

export interface MapProps {
  children?: ReactNode
  setMap?: (map: L.Map) => void
  center?: L.LatLng | any
}

const Map = ({ children, center, setMap }: MapProps) => {
  const centerDefault: L.LatLng = new L.LatLng(51.505, -0.09)
  const zoom = 13

  const displayMap = useMemo(() => {
    return (
      <MapContainer
        whenCreated={setMap}
        className="map-leaflet"
        center={center || centerDefault}
        zoom={zoom}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {children}
      </MapContainer>
    )
  }, [])

  return displayMap
}

export default Map
