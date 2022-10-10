import { useEffect } from "react"
import L from "leaflet"

type useMapOnMoveProps = (map: L.Map | undefined, cb: () => void) => void

export const useMapOnMove: useMapOnMoveProps = (map, cb) => {
  useEffect(() => {
    if (!map) return
    map.on("move", cb)

    return () => {
      map.off("move", cb)
    }
  }, [map])
}
