import { AuthenticationError, Link, useMutation, Routes, PromiseReturnType } from "blitz"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Form, FORM_ERROR } from "app/core/components/Form"
import login from "app/auth/mutations/login"
import { Login } from "app/auth/validations"
import React from "react"

type LoginFormProps = {
  onSuccess?: (user: PromiseReturnType<typeof login>) => void
}

export const LoginForm = (props: LoginFormProps) => {
  const [loginMutation] = useMutation(login)

  return (
    <div>
      <div className="w-full">
        <h1 className="my-4 text-2xl">Login</h1>

        <Form
          submitText="Login"
          schema={Login}
          initialValues={{ email: "", password: "" }}
          onSubmit={async (values) => {
            try {
              const user = await loginMutation(values)
              props.onSuccess?.(user)
            } catch (error: any) {
              if (error instanceof AuthenticationError) {
                return { [FORM_ERROR]: "Sorry, those credentials are invalid" }
              } else {
                return {
                  [FORM_ERROR]:
                    "Sorry, we had an unexpected error. Please try again. - " + error.toString(),
                }
              }
            }
          }}
        >
          <LabeledTextField
            name="email"
            label="Email"
            placeholder="Email"
            outerProps={{ className: "my-3" }}
          />
          <LabeledTextField
            name="password"
            label="Password"
            placeholder="Password"
            type="password"
            outerProps={{ className: "my-3" }}
          />
          <div>
            <Link href={Routes.ForgotPasswordPage()}>
              <a>Forgot your password?</a>
            </Link>
          </div>
        </Form>

        <div style={{ marginTop: "1rem" }}>
          Or <Link href={Routes.SignupPage()}>Sign Up</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginForm
