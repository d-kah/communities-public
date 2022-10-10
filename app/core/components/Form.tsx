import { ReactNode, PropsWithoutRef, createContext } from "react"
import { Form as FinalForm, FormProps as FinalFormProps } from "react-final-form"
import { z } from "zod"
import { validateZodSchema } from "blitz"
import Loader from "./Loader"

export { FORM_ERROR } from "final-form"

export interface FormProps<S extends z.ZodType<any, any>>
  extends Omit<PropsWithoutRef<JSX.IntrinsicElements["form"]>, "onSubmit"> {
  /** All your form fields */
  children?: ReactNode
  /** Text to display in the submit button */
  submitText?: string
  schema: S
  onSubmit: FinalFormProps<z.infer<S>>["onSubmit"]
  initialValues?: FinalFormProps<z.infer<S>>["initialValues"]
  mutators?: FinalFormProps["mutators"]
  title?: string
  disableSubmit?: boolean
  isUploading?: boolean
  //isChanged?: boolean
}

export function Form<S extends z.ZodType<any, any>>({
  children,
  submitText,
  schema,
  initialValues,
  onSubmit,
  mutators,
  disableSubmit,
  isUploading,
  // isChanged,
  ...props
}: FormProps<S>) {
  return (
    <FinalForm
      initialValues={initialValues}
      validate={validateZodSchema(schema)}
      onSubmit={onSubmit}
      mutators={mutators}
      disableSubmit={disableSubmit}
      render={({
        handleSubmit,
        submitting,
        submitError,
        form,
        values,
        pristine,
        // @ts-ignore https://github.com/final-form/react-final-form/issues/864
        disableSubmit,
      }) => {
        return (
          <>
            <div className="flex relative">
              <div className="hidden xl:block w-full px-6 absolute right-full text-xs">
                <div className="preFormat">{JSON.stringify(initialValues, undefined, 2)}</div>
              </div>
              <div className="w-full">
                <form onSubmit={handleSubmit} className="relative form" {...props}>
                  {children}

                  {submitError && (
                    <div className="submitError" role="alert" style={{ color: "red" }}>
                      {submitError}
                    </div>
                  )}

                  {submitText && (
                    <button
                      type="submit"
                      disabled={pristine || submitting || disableSubmit || isUploading}
                      className={`${
                        pristine ? "opacity-50 cursor-not-allowed" : ""
                      } h-16 relative mt-8 w-full flex items-center justify-center flex-grow py-3 border  text-base font-medium rounded-md text-white duration-300 bg-slate-700 hover:bg-slate-800 rounded py-2.5 px-4 text-white inline-block md:py-4 md:text-lg md:px-10`}
                    >
                      {isUploading ? (
                        <Loader className="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                      ) : (
                        submitText
                      )}
                    </button>
                  )}
                </form>
              </div>
              <div className="hidden xl:block w-full px-6 absolute left-full text-xs">
                <div className="preFormat">{JSON.stringify(values, undefined, 2)}</div>
              </div>
            </div>
          </>
        )
      }}
    />
  )
}

export default Form
