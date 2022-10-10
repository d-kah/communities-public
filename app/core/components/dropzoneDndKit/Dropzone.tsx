import { ReactNode, useMemo } from "react"
import { useDropzone } from "react-dropzone"
import classNames from "classnames"
import { BsFillImageFill } from "react-icons/bs"

interface DropzoneProps {
  onDrop: (acceptedFiles: File[]) => Promise<void>
  isImagesAdded: boolean
  children: ReactNode
}

export default function Dropzone({ onDrop, isImagesAdded, children }: DropzoneProps) {
  const {
    acceptedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isFocused,
    isDragAccept,
    isDragReject,
  } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 5,
    maxSize: 3000000,
  })

  const imagesStyles = `
    bg-slate-50
    p-4
    border
    border-slate-400
    border-dashed
    ease-in-out
    duration-300
    cursor-pointer
    ${classNames({
      "border-slate-700 bg-slate-200": isDragAccept || isFocused,
      "border-[#ff1744]": isDragReject,
    })}`

  const noImagesStyles = `
  w-[500px]
  h-[400px]
  flex-1
  flex
  flex-row
  items-center
  justify-center
  p-10
  border
  border-slate-400
  border-dashed
  bg-slate-50
  text-slate-700
  ease-in-out
  duration-300
  my-2
  cursor-pointer
    ${classNames({
      "border-slate-700 bg-slate-200": isDragAccept || isFocused,
      "border-[#ff1744]": isDragReject,
    })}
  `

  const classNameNoImages = useMemo(() => noImagesStyles, [isFocused, isDragAccept, isDragReject])

  const classNameImages = useMemo(() => imagesStyles, [isFocused, isDragAccept, isDragReject])

  const noImagesUploaded = (
    <>
      <div {...getRootProps({ className: classNameNoImages })}>
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop to upload</p>
        ) : (
          <div className="flex flex-col items-center">
            <BsFillImageFill />
            <p>Drag your photos here</p>
            <p>Add max 5 photos</p>
          </div>
        )}
      </div>

      <aside className="flex flex-row flex-wrap mt-4">{children}</aside>
    </>
  )

  const imagesUploaded = (
    <div {...getRootProps({ className: classNameImages })}>
      <input {...getInputProps()} />
      <div>{children}</div>
    </div>
  )

  return <div>{isImagesAdded ? imagesUploaded : noImagesUploaded}</div>
}
