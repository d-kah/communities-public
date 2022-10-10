import { z } from "zod"
import { nanoid } from "nanoid"

const regexUrlUnescaped = new RegExp("^[a-zA-Z0-9_]*$", "i")
const UrlUnescapedSchema = z.string().regex(regexUrlUnescaped)

// UrlUnescapedSchema to avoid an encoded and decoded Url and Key mismatch in S3.
export const TEMP_PREFIX = z.literal(UrlUnescapedSchema.parse("temp_")).value

const castToNumber = z.preprocess((val) => Number(val), z.number())

export const mutations = {
  UNMUTATED: "unmutated",
  MUTATED: "mutated",
}

export const ImageSchema = z.object({
  id: z.number().nullable().default(null),
  communityId: z.number().nullable().default(null),
  uuid: z
    .string()
    .optional()
    .transform((arg) => arg ?? nanoid()),
  status: z
    .literal(mutations.UNMUTATED)
    .or(z.literal(mutations.MUTATED))
    .default(mutations.UNMUTATED),
  cloudId: z.string().nullable().default(null),
  cloudUrl: z.string().nullable().default(null),
  order: z.number().nullable().default(null),
  previewUrl: z.string().nullable().default(null),
  name: z.string(),
  isUploaded: z.boolean().default(true),
  file: z.any(),
})

export const ImageIsNotUploadedSchema = ImageSchema.extend({
  cloudId: z.null(),
  cloudUrl: z.null(),
})

export const ImagesSchema = ImageSchema.array()

export const ImageDeleteDbSchema = ImageSchema.extend({
  status: z.literal(mutations.MUTATED).transform(() => undefined),
  id: z.number(),
  cloudUrl: z.null(),
  order: z.null(),
})

export const ImageDeleteSchema = ImageSchema.extend({
  status: z.string().transform((str) => mutations.MUTATED),
  cloudUrl: z
    .string()
    .url()
    .transform((str) => null),
  order: z.number().transform((num) => null),
})

export const IsImageDeletedSchema = ImageSchema.extend({
  status: z.literal(mutations.MUTATED),
  cloudUrl: z.null(),
  order: z.null(),
  isUploaded: z.literal(true),
})

export const ImageDeleteMutateAdjacentSiblingOrderSchema = ImageSchema.extend({
  status: z.string().transform((str) => mutations.MUTATED),
  order: z
    .number()
    .nullable()
    .transform((num) => num && --num),
})

/*
export const ImageUpdateOrderSchema = ImageSchema.extend({
  status: z.string().transform((str) => mutations.MUTATED),
  order: z.number().transform((num) => num && --num),
})
*/

export const ImageDeleteS3Schema = ImageSchema.extend({
  cloudUrl: z.null(),
  order: z.null(),
})

const includesTempStr = (val: string) => val.includes(TEMP_PREFIX)
const removeTempStr = (val: string) => val.replace(TEMP_PREFIX, "")

export const ImagePersistS3Schema = ImageSchema.extend({
  cloudUrl: z.string().refine(includesTempStr),
  cloudId: z.string().refine(includesTempStr),
})

const ImageCreateDbSchema = z.object({
  name: z.string(),
  cloudUrl: z.string().refine(includesTempStr).transform(removeTempStr),
  cloudId: z.string().refine(includesTempStr).transform(removeTempStr),
  order: z.number(),
})

const omitProperty = z.any().transform(() => undefined)

export const CloudIdPersistSchema = ImageCreateDbSchema.shape.cloudId

export const ImagesCreateDbSchema = ImageCreateDbSchema.array()

export const ImageUpdateCreateDbSchema = ImageSchema.extend({
  status: z.literal(mutations.MUTATED).transform(() => undefined),
  cloudUrl: z.string().transform(removeTempStr),
  cloudId: z.string().transform(removeTempStr),
  order: z.number(),
  id: omitProperty,
  communityId: omitProperty,
  uuid: omitProperty,
  isUploaded: omitProperty,
  previewUrl: omitProperty,
  file: omitProperty,
})

export const ImageUpdateDeleteDbSchema = ImageUpdateCreateDbSchema.extend({
  id: z.number(),
})

export const ImagesUpdateDbSchema = ImageUpdateCreateDbSchema.array()

export const ImagesPersistedDbSchema = ImageSchema.extend({
  id: z.number(),
  communityId: z.number(),
  cloudUrl: z.string().url(),
  order: z.number(),
}).array()

export const ImagesDbCreatePreprocess = (images?: z.infer<typeof ImagesSchema>) =>
  images?.filter((image) => image.cloudUrl !== null || image.order !== null)

export const imageUpdateOrder = (image: z.infer<typeof ImageSchema>, index: number) => {
  image.status = "mutated"
  image.order = index
  return image
}

export const CommunitySchema = z.object({
  id: z.number(),
  userId: z.number(),
  name: z.string(),
  // lat and lng are type Decimal in db and return as objects
  // Therefore casting them from objects to numbers
  lat: castToNumber,
  lng: castToNumber,
  images: ImagesPersistedDbSchema,
})

export const CommunityUpdateSchema = CommunitySchema.extend({
  images: ImagesSchema,
})

export const CommunityCreateSchema = CommunitySchema.extend({
  id: z.undefined(),
  userId: z.undefined(),
  images: ImagesSchema.optional(),
})

export const CommunitiesSchema = CommunitySchema.array()
