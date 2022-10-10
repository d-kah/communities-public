import { BlitzApiHandler, getSession } from "blitz"
import { S3Client, CopyObjectCommand } from "@aws-sdk/client-s3"
import { CloudIdPersistSchema } from "app/communities/validations"

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

    const cloudIdPersist = CloudIdPersistSchema.safeParse(req.body.cloudId)
    if (!cloudIdPersist.success) {
      res.status(401).end()
      return
    }

    const command = new CopyObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      CopySource: encodeURIComponent(`${process.env.AWS_BUCKET_NAME}/${req.body.cloudId}`),
      Key: cloudIdPersist.data,
    })

    const response = await client.send(command)

    res.statusCode = 200
    res.setHeader("Content-Type", "application/json")
    res.end(JSON.stringify(response))
  }
}
export default handler
