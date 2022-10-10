import React, { Dispatch, isValidElement, ReactNode, SetStateAction, useState } from "react"
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  DragOverlay,
  useSensor,
  useSensors,
  DragStartEvent,
  UniqueIdentifier,
  DragEndEvent,
  DragCancelEvent,
} from "@dnd-kit/core"

import { arrayMove, SortableContext, rectSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { z } from "zod"
import { ImagesSchema } from "app/communities/validations"
import { CSS } from "@dnd-kit/utilities"

interface DragImagesProps {
  // previews: z.infer<typeof ImagePreviewsSchema>
  // setPreviews: Dispatch<SetStateAction<z.infer<typeof ImagePreviewsSchema>>>
  // previewIds: UniqueIdentifier[]
  // setPreviewIds: Dispatch<SetStateAction<UniqueIdentifier[]>>
  // files: FileWithPreview[]
  // setFiles: Dispatch<SetStateAction<FileWithPreview[]>>
  // images: z.infer<typeof ImagesSchema>
  //setImages: Dispatch<SetStateAction<z.infer<typeof ImagesSchema>>>
  ids: UniqueIdentifier[]
  children: ReactNode
  onDragEnd: ({ activeId, overId }: onDragEndProps) => void
}

export interface onDragEndProps {
  activeId: UniqueIdentifier
  overId: UniqueIdentifier
}

export default function DndKit({ ids, children, ...props }: DragImagesProps) {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>()
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor))

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over) return

    if (active.id !== over.id) {
      props.onDragEnd({ activeId: active.id, overId: over.id })
    }

    setActiveId(null)
  }

  const onDragCancel = (event: DragCancelEvent) => {
    setActiveId(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  )
}

const Item = ({ id, children, ...props }: any) => {
  const {
    attributes,
    listeners,
    // isDragging,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} id={id} {...props}>
      <div className="cursor-grab absolute inset-0" {...listeners} {...attributes}></div>
      {children}
    </div>
  )
}

DndKit.Item = Item

/*
<SortableContext items={previewIds} strategy={rectSortingStrategy}>
          {children}
        </SortableContext>
 */
