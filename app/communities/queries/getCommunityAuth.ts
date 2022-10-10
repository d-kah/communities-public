import { resolver, NotFoundError, AuthorizationError } from "blitz"
import db from "db"
import { z } from "zod"
import { CommunitySchema } from "../validations"
import { GetCommunity } from "app/communities/queries/getCommunity"

export default resolver.pipe(
  resolver.zod(GetCommunity),
  resolver.authorize(),
  async ({ id }, ctx) => {
    // TODO: in multi-tenant app, you must add validation to ensure correct tenant
    const community = await db.community.findFirst({
      where: { id },
      include: {
        images: true,
      },
    })

    if (!community) throw new NotFoundError()

    if (ctx.session.userId !== community.userId) throw new AuthorizationError()

    return CommunitySchema.parse(community)
  }
)
