import { FieldProps, useField } from "react-final-form"

const FormError = ({ name, errorMessage }: FieldProps<string, any>) => {
  const {
    meta: { touched, error },
  } = useField(name, { subscription: { touched: true, error: true } })

  return touched && error ? (
    <div role="alert" style={{ color: "red" }}>
      {errorMessage || error}
    </div>
  ) : null
}

export default FormError
