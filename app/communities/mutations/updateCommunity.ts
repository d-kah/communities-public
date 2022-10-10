import { AuthorizationError, NotFoundError, resolver } from "blitz"
import { z } from "zod"
import db from "db"
import {
  CommunitySchema,
  ImageUpdateCreateDbSchema,
  ImageDeleteDbSchema,
  ImagesUpdateDbSchema,
  CommunityUpdateSchema,
  ImageUpdateDeleteDbSchema,
} from "app/communities/validations"

// https://github.com/prisma/prisma-client-js/issues/315
const deleteIfExists = async (id: number) => {
  const found = await db.communityImage.findUnique({
    where: {
      id,
    },
  })

  return !!found
}

export default resolver.pipe(
  resolver.zod(CommunityUpdateSchema),
  resolver.authorize(),
  async ({ images: images, ...input }, ctx) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const community = await db.community.findFirst({ where: { id: input.id } })

    if (!community || ctx.session.userId !== community.userId) throw new AuthorizationError()

    const imagesDeleteId: Array<number> = []
    const imagesUpdate: z.infer<typeof ImagesUpdateDbSchema> = []

    for (let i = 0; i < images.length; i++) {
      const resultDelete = ImageDeleteDbSchema.safeParse(images[i])

      if (resultDelete.success) {
        const exists = await deleteIfExists(resultDelete.data.id)
        if (!exists) continue
        imagesDeleteId.push(resultDelete.data.id)
      }

      const resultUpdateDelete = ImageUpdateDeleteDbSchema.safeParse(images[i])
      if (resultUpdateDelete.success) {
        imagesDeleteId.push(resultUpdateDelete.data.id)
      }

      const resultUpdateCreate = ImageUpdateCreateDbSchema.safeParse(images[i])
      if (resultUpdateCreate.success) {
        imagesUpdate.push(resultUpdateCreate.data)
      }
    }

    // https://github.com/prisma/prisma/issues/5066
    // upsertMany does not exist yet. Hence deleteMany and createMany
    const communityUpdated = await db.community.update({
      where: { id: input.id },
      data: {
        ...input,
        images: {
          deleteMany: {
            id: {
              in: imagesDeleteId,
            },
          },
          createMany: {
            data: imagesUpdate,
          },
        },
      },
      include: {
        images: true,
      },
    })

    return CommunitySchema.parse(communityUpdated)
  }
)
