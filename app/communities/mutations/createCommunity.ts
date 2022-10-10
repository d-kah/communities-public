import { resolver } from "blitz"
import db from "db"
import {
  CommunitySchema,
  CommunityCreateSchema,
  ImagesCreateDbSchema,
  ImagesDbCreatePreprocess,
} from "app/communities/validations"

export default resolver.pipe(
  resolver.zod(CommunityCreateSchema),
  resolver.authorize(),
  async ({ images, ...input }, ctx) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const result = ImagesCreateDbSchema.safeParse(ImagesDbCreatePreprocess(images))

    const community = await db.community.create({
      data: {
        ...input,
        userId: ctx.session.userId,
        ...(result.success && {
          images: {
            createMany: {
              data: result.data,
            },
          },
        }),
      },
      include: {
        images: true,
      },
    })

    return CommunitySchema.parse(community)
  }
)
