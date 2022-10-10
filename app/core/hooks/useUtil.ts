import { z } from "zod"

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

interface _dataUrlResizeProps {
  file: File
  width: number
  height: number
  base64: string
}

interface _uint8ArrayToBlob {
  file: File
  uint8Array: Uint8Array
}

const useUtil = () => {
  // todo image processing should be done server side. Use aws lambda with node sharp library

  const _uint8ArrayToBlob = ({ file, uint8Array }: _uint8ArrayToBlob) =>
    new Blob([new Uint8Array(uint8Array)], { type: file.type })

  const _dataUrlToUint8Array = (dataUrl: string) => Buffer.from(dataUrl.split(",")[1]!, "base64")

  const _fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve) => {
      const reader = new FileReader()

      reader.onload = (e) => {
        resolve(String(e.target!.result))
      }

      reader.readAsDataURL(file)
    })

  const _dataUrlResize = ({
    file,
    width,
    height,
    base64,
  }: _dataUrlResizeProps): Promise<string> => {
    return new Promise((resolve) => {
      const imageEl = new Image()
      imageEl.src = base64

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      canvas.width = width //?? ctx.canvas.width
      canvas.height = height //?? ctx.canvas.height

      imageEl.addEventListener("load", function () {
        _imageResize({ ctx, imageEl })

        resolve(canvas.toDataURL(file.type))
      })
    })
  }

  interface dataUrlResizeProps {
    dataUrl?: string
    type: string
    width?: number
    height?: number
  }

  const dataUrlResize = ({ dataUrl, type, height, width }: dataUrlResizeProps): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!dataUrl) reject()

      const imageEl = new Image()
      imageEl.src = dataUrl!

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")!

      canvas.width = width ?? ctx.canvas.width
      canvas.height = height ?? ctx.canvas.height

      imageEl.addEventListener("load", function () {
        _imageResize({ ctx, imageEl })

        resolve(canvas.toDataURL(type))
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

  interface urlToFileProps {
    url: string
    key: string
  }

  const urlToFile = ({ url, key }: urlToFileProps): Promise<File> =>
    new Promise((resolve) => {
      try {
        fetch(url, {
          mode: "cors",
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        }).then(async (response) => {
          const type = response.headers.get("content-type")
          const blob = await response.blob()
          const file = new File([blob], key, { type: type ?? undefined })
          resolve(file)
        })
      } catch (error) {
        console.error(error)
      }
    })

  const resizeImageFileToBase64 = async ({
    file,
    width,
    height,
  }: {
    file: File
    width: number
    height: number
  }) => {
    const base64 = await _fileToBase64(file)
    return await _dataUrlResize({
      file,
      width,
      height,
      base64,
    })
  }

  const resizeImageFileToBlob = async ({
    file,
    width,
    height,
  }: {
    file: File
    width: number
    height: number
  }) => {
    //if (!file) return

    const base64 = await _fileToBase64(file)
    const dataUrl = await _dataUrlResize({
      file,
      width,
      height,
      base64,
    })
    const uint8Array = _dataUrlToUint8Array(dataUrl)
    return _uint8ArrayToBlob({ file, uint8Array })
  }

  return {
    resizeImageFileToBlob,
    resizeImageFileToBase64,
    urlToFile,
    dataUrlResize,
  }
}

export default useUtil
