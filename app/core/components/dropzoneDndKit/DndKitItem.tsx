import { ImageSchema } from "app/communities/validations"
import classNames from "classnames"
import { MouseEvent } from "react"
import { BsX } from "react-icons/bs"
import { z } from "zod"
import Loader from "../Loader"
import DndKit from "./DndKit"

interface DndKitItemProps {
  image: z.infer<typeof ImageSchema>
  index: number
  onDelete: (id: string) => (e: MouseEvent<HTMLDivElement>) => void
  isUploaded: boolean
}

export function DndKitItem({ image, index, onDelete, isUploaded }: DndKitItemProps) {
  return (
    <DndKit.Item
      key={image.uuid}
      id={image.uuid}
      className={classNames("relative z-50", {
        "col-span-2 row-span-2": index === 0,
      })}
    >
      <div
        onClick={onDelete(image.uuid!)}
        className="cursor-pointer bg-white -right-4 -top-4 w-10 h-10 absolute z-30 drop-shadow-lg rounded-full flex justify-center items-center"
      >
        <BsX />
      </div>
      <img
        src={image.previewUrl ?? image.cloudUrl ?? undefined}
        // Revoke data uri after image is loaded
        onLoad={() => image.previewUrl && URL.revokeObjectURL(image.previewUrl)}
        className={classNames("block w-full h-full rounded", {
          "opacity-50": !isUploaded,
        })}
        alt={image.name}
      />
      {!isUploaded && <Loader className="absolute z-50 top-2 left-2" />}
    </DndKit.Item>
  )
}
