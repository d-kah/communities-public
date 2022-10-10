import { BlitzApiHandler, getSession } from "blitz"
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { TEMP_PREFIX } from "app/communities/validations"

const client = new S3Client({
  region: "eu-west-3",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? "",
  },
})

const handler: BlitzApiHandler = async (req, res) => {
  if (req.method === "POST") {
    const session = await getSession(req, res)

    if (!session.$isAuthorized()) {
      res.status(401).end()
      return
    }

    const cloudIdTemp = req.body.cloudId.includes(TEMP_PREFIX)
      ? req.body.cloudId
      : `${TEMP_PREFIX}${req.body.cloudId}`

    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: cloudIdTemp,
    })

    const response = await client.send(command)

    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(response))
  }
}
export default handler
