import { dynamic } from "blitz"
import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { z } from "zod"
import { Router } from "blitz"
import FormError from "app/core/components/FormError"
import React, { useState } from "react"
import arrayMutators from "final-form-arrays"
import ImagesUploader from "app/core/components/dropzoneDndKit/ImagesUploader"

export { FORM_ERROR } from "app/core/components/Form"

// Leaflet map only works in browser. It uses the window object without first checking if it's available
// Therefore it is excluded from serverside rendering
const CommunityFormMap = dynamic(() => import("app/communities/components/CommunityFormMap"), {
  ssr: false,
})

export function CommunityForm<S extends z.ZodType<any, any>>({
  title,
  initialValues,
  ...props
}: FormProps<S>) {
  const [isUploading, setIsUploading] = useState<boolean>(false)

  return (
    <div className="w-[530px] px-3 pb-[30px] mx-auto">
      <div className="my-6">
        <a onClick={() => Router.back()}>
          <span>&#60;</span> Back
        </a>
      </div>

      <h1 className="my-4 text-2xl">{title}</h1>
      <Form<S>
        mutators={{
          ...arrayMutators,
          setLatLng: (args: any[], state: any, tools: any) => {
            tools.changeValue(state, "lat", () => args[0].lat)
            tools.changeValue(state, "lng", () => args[0].lng)
          },
        }}
        isUploading={isUploading}
        initialValues={initialValues}
        {...props}
      >
        <CommunityFormMap
          error={<FormError name="lat" errorMessage={"Please set the location"} />}
        />
        <LabeledTextField name="lat" label="" hideError readOnly hidden type="number" />
        <LabeledTextField name="lng" label="" hideError readOnly hidden type="number" />
        <LabeledTextField
          name="name"
          label="Name"
          placeholder="Name"
          outerProps={{ className: "mb-6" }}
          className="mb-1"
        />
        <ImagesUploader setIsUploading={setIsUploading} isUploading={isUploading} />
      </Form>
    </div>
  )
}
