import {
  ImagePersistS3Schema,
  ImageDeleteS3Schema,
  ImagesSchema,
} from "app/communities/validations"
import { useS3 } from "./useS3"
import { z } from "zod"
import { useS3BlobUploader } from "./useS3BlobUploader"

interface handleImagesProps<PersistTemp extends z.ZodTypeAny, DeleteTemp extends z.ZodTypeAny> {
  images: z.infer<typeof ImagesSchema>
  persistTempSchema: PersistTemp
  deleteTempSchema: DeleteTemp
}

export const useImageStorage = () => {
  const { persistTempS3, deleteS3 } = useS3()
  const { uploadS3 } = useS3BlobUploader()

  const deleteImages = async (ids?: Array<string | null>) => {
    if (!ids || ids.length === 0) return

    for (let i = 0; i < ids.length; i++) {
      await deleteS3(ids[i] ?? undefined)
    }
  }

  const handleImages = async <PersistTemp extends z.ZodTypeAny, DeleteTemp extends z.ZodTypeAny>({
    images,
    persistTempSchema,
    deleteTempSchema,
  }: handleImagesProps<PersistTemp, DeleteTemp>) => {
    if (!images) return

    for (let i = 0; i < images.length; i++) {
      const persistTemp = persistTempSchema.safeParse(images[i])

      if (persistTemp.success) {
        await persistTempS3(persistTemp.data.cloudId)
      }

      const deleteTemp = deleteTempSchema.safeParse(images[i])
      if (deleteTemp.success) {
        await deleteS3(deleteTemp.data.cloudId)
      }
    }
  }

  const handleImagesCommunity = async (images?: z.infer<typeof ImagesSchema>) => {
    if (!images) return

    await handleImages({
      images,
      persistTempSchema: ImagePersistS3Schema,
      deleteTempSchema: ImageDeleteS3Schema,
    })
  }

  return { handleImagesCommunity, uploadS3, deleteImages }
}
