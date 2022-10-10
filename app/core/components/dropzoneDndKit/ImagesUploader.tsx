import Dropzone from "./Dropzone"
import { useCallback, useEffect, useRef, useState } from "react"
import DndKit, { onDragEndProps } from "./DndKit"
import { useForm, Field } from "react-final-form"
import { nanoid } from "nanoid"
import { FormApi } from "final-form"
import {
  ImageDeleteMutateAdjacentSiblingOrderSchema,
  ImageDeleteSchema,
  ImageIsNotUploadedSchema,
  ImageSchema,
  ImagesSchema,
  IsImageDeletedSchema,
} from "app/communities/validations"
import useUtil from "app/core/hooks/useUtil"
import { useImageStorage } from "app/core/hooks/useImageStorage"
import { z } from "zod"
import { UniqueIdentifier } from "@dnd-kit/core"
import { DndKitItem } from "./DndKitItem"
import useForceUpdate from "app/core/hooks/useForceUpdate"
import { arrayMove } from "@dnd-kit/sortable"

const DROPZONE_IMAGES_RESIZE_IMAGE_HEIGHT = 220
const DROPZONE_IMAGES_RESIZE_IMAGE_WIDTH = 220

interface ImagesUploaderProps {
  setIsUploading: (isUploading: boolean) => void
  isUploading: boolean
}

export default function ImagesUploader({ setIsUploading, isUploading }: ImagesUploaderProps) {
  const Util = useUtil()
  const { uploadS3 } = useImageStorage()
  const form = useForm<FormApi>()
  const forceUpdate = useForceUpdate()

  // @ts-ignore
  const formImages = ImagesSchema.parse(form.getState().values.images ?? [])
  const [imagesUI, setImagesUI] = useState(formImages.filter((image) => image.order !== null))
  const [imagesIdsNotUpload, setImagesIdsNotUpload] = useState<Array<string>>([])

  const uploadImages = useCallback(
    async (images: z.infer<typeof ImagesSchema>) => {
      for (let i = 0; i < images.length; i++) {
        const result = ImageIsNotUploadedSchema.safeParse(images[i])

        if (result.success) {
          setIsUploading(true)

          const { s3CloudUrl, s3CloudId } = await uploadS3({ blob: images[i]?.file })

          const imageUploaded = ImageSchema.parse({
            ...images[i],
            cloudId: s3CloudId,
            cloudUrl: s3CloudUrl,
            isUploaded: true,
          })

          form.mutators.update!("images", i, imageUploaded)
          setImagesIdsNotUpload((ids) => ids.filter((id) => id !== imageUploaded.uuid))
        }
      }

      setIsUploading(false)
    },
    [form.mutators.update, setIsUploading, uploadS3]
  )

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const imagesOrder = (images: z.infer<typeof ImagesSchema>) => {
        let order = -1
        return images.reduce((images: z.infer<typeof ImagesSchema>, image) => {
          const result = IsImageDeletedSchema.safeParse(image)

          if (result.success) {
            return [...images, ImageSchema.parse(image)]
          } else {
            order++
            return [
              ...images,
              ImageSchema.parse({
                ...image,
                order,
              }),
            ]
          }
        }, [])
      }

      const imagesResize = async (files: Array<File>) => {
        const images: z.infer<typeof ImagesSchema> = []

        for (let i = 0; i < files.length; i++) {
          const blob = await Util.resizeImageFileToBlob({
            file: files[i]!,
            width: DROPZONE_IMAGES_RESIZE_IMAGE_WIDTH,
            height: DROPZONE_IMAGES_RESIZE_IMAGE_HEIGHT,
          })

          const image = ImageSchema.parse({
            status: "mutated",
            previewUrl: URL.createObjectURL(blob),
            name: files[i]?.name,
            isUploaded: false,
            file: blob,
          })

          images.push(image)
        }

        return images
      }

      const updateFormImages = (images: z.infer<typeof ImagesSchema>) => {
        images.forEach((image, index) => {
          form.mutators.update!("images", index, image)
        })
      }

      const imagesResized = await imagesResize(acceptedFiles)

      // @ts-ignore
      const formImages = ImagesSchema.parse(form.getState().values.images ?? [])
      const imagesOrdered = imagesOrder([...formImages, ...imagesResized])
      updateFormImages(imagesOrdered)

      setImagesIdsNotUpload(
        imagesOrdered.filter((image) => !image.isUploaded).map((image) => image.uuid)
      )
      setImagesUI(imagesOrdered)
      uploadImages(imagesOrdered)
    },
    [Util, form, uploadImages]
  )

  const onDragEnd = useCallback(
    async ({ activeId, overId }) => {
      const onDragEndImagesUI = ({ activeId, overId }: onDragEndProps) => {
        const imagesUIactiveIndex = imagesUI.findIndex((imageUI) => imageUI.uuid === activeId)
        const imagesUIoverIndex = imagesUI.findIndex((imageUI) => imageUI.uuid === overId)
        setImagesUI((imagesUI) => arrayMove(imagesUI, imagesUIactiveIndex, imagesUIoverIndex))
      }

      const onDragEndFormImages = ({ activeId, overId }: onDragEndProps) => {
        // @ts-ignore
        const formImages = ImagesSchema.parse(form.getState().values.images ?? [])

        const activeIndex = formImages.findIndex((formImage) => formImage.uuid === activeId)
        const overIndex = formImages.findIndex((formImage) => formImage.uuid === overId)

        const formImagesMoved = arrayMove(formImages, activeIndex, overIndex)
        const lowestIndex = activeIndex < overIndex ? activeIndex : overIndex

        let order = lowestIndex - 1
        for (let index = lowestIndex; index < formImagesMoved.length; index++) {
          const result = IsImageDeletedSchema.safeParse(formImagesMoved[index])

          if (result.success) {
            form.mutators.update!("images", index, ImageSchema.parse(formImagesMoved[index]))
          } else {
            order++
            form.mutators.update!(
              "images",
              index,
              ImageSchema.parse({
                ...formImagesMoved[index],
                status: "mutated",
                order,
              })
            )
          }
        }
      }

      onDragEndImagesUI({ activeId, overId })
      onDragEndFormImages({ activeId, overId })
    },
    [form, imagesUI]
  )

  const onDelete = (uuid: string) => (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()

    if (isUploading) return

    const onDeleteImagesUI = (uuid: string) => {
      setImagesUI((imagesUI) => imagesUI.filter((imageUI) => imageUI.uuid !== uuid))
    }

    const onDeleteFormImages = (uuid: string) => {
      const index = formImages.findIndex((image) => image.uuid === uuid)

      form.mutators.update!("images", index, ImageDeleteSchema.parse(formImages[index]))

      for (let i = index + 1; i < formImages.length; i++) {
        form.mutators.update!(
          "images",
          i,
          ImageDeleteMutateAdjacentSiblingOrderSchema.parse(formImages[i])
        )
      }
    }

    onDeleteImagesUI(uuid)
    onDeleteFormImages(uuid)
  }

  return (
    <div>
      {/*<pre className="text-xs">{JSON.stringify(imagesUI, null, 2)}</pre>*/}
      <Dropzone onDrop={onDrop} isImagesAdded={imagesUI.length > 0}>
        <DndKit ids={imagesUI.map((image) => image.uuid as UniqueIdentifier)} onDragEnd={onDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {imagesUI.map((image, index) => (
              <DndKitItem
                key={image.uuid}
                image={image}
                index={index}
                onDelete={onDelete}
                isUploaded={!imagesIdsNotUpload.includes(image.uuid)}
              />
            ))}
          </div>
        </DndKit>
      </Dropzone>

      <div className="hidden">
        {/* pristine does not update when changing images solely over formApi https://github.com/final-form/final-form/issues/169 */}
        {formImages.map((image, index) => (
          <div key={image.uuid}>
            <Field name={`images[${index}].order`} component="input" />
            <Field name={`images[${index}].uuid`} component="input" />
          </div>
        ))}
      </div>
    </div>
  )
}
