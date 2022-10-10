import { BlitzApiHandler, getSession } from "blitz"
import { nanoid } from "nanoid"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { TEMP_PREFIX } from "../communities/validations"

const client = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
})

// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300

interface getUploadUrlProps {
  currentCloudId?: string
}

const getUploadUrl = async function ({ currentCloudId }: getUploadUrlProps) {
  const newId = nanoid()

  const s3CloudId = currentCloudId ?? `${TEMP_PREFIX}${newId}`

  const command = new PutObjectCommand({
    Key: s3CloudId,
    Bucket: process.env.AWS_BUCKET_NAME,
  })

  const s3CloudSignedUrl = await getSignedUrl(client, command, {
    expiresIn: URL_EXPIRATION_SECONDS,
  })

  return {
    s3CloudSignedUrl,
    s3CloudId,
  }
}

const handler: BlitzApiHandler = async (req, res) => {
  if (req.method === "POST") {
    const session = await getSession(req, res)

    if (!session.$isAuthorized()) {
      res.status(401).end()
      return
    }

    const result = await getUploadUrl({
      currentCloudId: req.body.currentCloudId,
    })

    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(result))
  }
}
export default handler
