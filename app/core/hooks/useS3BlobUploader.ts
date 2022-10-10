import { useState } from "react"
import { z } from "zod"
import axios from "axios"
import { getAntiCSRFToken } from "blitz"
const URL_BASE = "https://communities-58zi.onrender.com"

interface uploadS3Props {
  blob?: Blob
  currentCloudId?: string
}

export const useS3BlobUploader = () => {
  const [uploadUrl, setUploadUrl] = useState<string>()

  const uploadS3 = ({ blob, currentCloudId }: uploadS3Props) => {
    return new Promise<{ s3CloudUrl: string; s3CloudId: string }>(async (resolve, reject) => {
      if (!blob) reject()

      const antiCSRFToken = getAntiCSRFToken()
      if (!antiCSRFToken) reject()

      const {
        data: { s3CloudSignedUrl, s3CloudId },
      } = await axios({
        method: "post",
        url: `${URL_BASE}/api/s3url`,
        data: {
          currentCloudId,
        },
        headers: {
          "anti-csrf": antiCSRFToken,
        },
      })

      // https://github.com/axios/axios/issues/1569
      // const response = await axios.put(signedUrl, blob)
      const response = await fetch(s3CloudSignedUrl, {
        method: "PUT",
        body: blob,
      })

      const s3CloudUrl = response.url.split("?")[0] ?? ""

      resolve({ s3CloudUrl, s3CloudId })
    })
  }

  const ZeroToOneClampSchema = z.number().gte(0).lte(1).default(0.5)

  interface _imageResizeProps {
    ctx: CanvasRenderingContext2D
    imageEl: HTMLImageElement
    x?: number
    y?: number
    w?: number
    h?: number
    offsetXArg?: z.infer<typeof ZeroToOneClampSchema>
    offsetYArg?: z.infer<typeof ZeroToOneClampSchema>
  }

  type _dataURIResizeType = (
    file: File
  ) => ([width, height]: [number, number]) => (dataURI: string) => Promise<string>

  const Util = (() => {
    const _pipe =
      <T>(...fns: any) =>
      (x: any): Promise<T> =>
        fns.reduce((p: any, fn: any) => p.then(fn), Promise.resolve(x))

    const _uint8ArrayToBlob = (file: File) => (uint8Array: Uint8Array) =>
      new Blob([new Uint8Array(uint8Array)], { type: file.type })

    const _dataURIToUint8Array = (dataURI: string) => Buffer.from(dataURI.split(",")[1]!, "base64")

    const _fileToBase64 = (file: File) =>
      new Promise((resolve) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          resolve(String(e.target!.result))
        }

        reader.readAsDataURL(file)
      })

    const _dataURIResize: _dataURIResizeType =
      (file) =>
      ([w, h]) =>
      (dataURI) => {
        const imageEl = new Image()
        imageEl.src = dataURI

        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")!

        canvas.width = w //?? ctx.canvas.width
        canvas.height = h //?? ctx.canvas.height

        return new Promise((resolve) => {
          imageEl.addEventListener("load", function () {
            _imageResize({ ctx, imageEl })

            resolve(canvas.toDataURL(file.type))
          })
        })
      }

    // https://stackoverflow.com/questions/21961839/simulation-background-size-cover-in-canvas
    const _imageResize = ({
      ctx,
      imageEl,
      x = 0,
      y = 0,
      w = ctx.canvas.width,
      h = ctx.canvas.height,
      offsetXArg,
      offsetYArg,
    }: _imageResizeProps) => {
      const offsetX = ZeroToOneClampSchema.parse(offsetXArg)
      const offsetY = ZeroToOneClampSchema.parse(offsetYArg)

      let iw = imageEl.width,
        ih = imageEl.height,
        r = Math.min(w / iw, h / ih),
        nw = iw * r, // new prop. width
        nh = ih * r, // new prop. height
        cx,
        cy,
        cw,
        ch,
        ar = 1

      // decide which gap to fill
      if (nw < w) ar = w / nw
      if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh // updated
      nw *= ar
      nh *= ar

      // calc source rectangle
      cw = iw / (nw / w)
      ch = ih / (nh / h)

      cx = (iw - cw) * offsetX
      cy = (ih - ch) * offsetY

      // make sure source rectangle is valid
      if (cx < 0) cx = 0
      if (cy < 0) cy = 0
      if (cw > iw) cw = iw
      if (ch > ih) ch = ih

      // fill image in dest. rectangle
      ctx.drawImage(imageEl, cx, cy, cw, ch, x, y, w, h)
    }

    const resizeImageFileToBase64 = async ({
      file,
      width,
      height,
    }: {
      file: File
      width: number
      height: number
    }) => await _pipe<string>(_fileToBase64, _dataURIResize(file)([width, height]))(file)

    const imageFileToBlob = async ({ file }: { file: File }) =>
      await _pipe<Blob>(_fileToBase64, _dataURIToUint8Array, _uint8ArrayToBlob(file))(file)

    return {
      imageFileToBlob,
      resizeImageFileToBase64,
    }
  })()

  const uploadBlob = async (blob?: Blob) => {
    if (!blob) return

    const {
      data: { signedUrl, Key },
    } = await axios.get(`${URL_BASE}/api/s3url`)

    // https://github.com/axios/axios/issues/1569
    // const response = await axios.put(signedUrl, blob)
    const response = await fetch(signedUrl, {
      method: "PUT",
      body: blob,
    })

    setUploadUrl(response.url.split("?")[0])
  }

  return {
    uploadS3,
    uploadBlob,
    uploadUrl,
    Util,
  }
}
