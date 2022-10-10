import { useRouter, BlitzPage } from "blitz"
import Layout from "app/core/layouts/Layout"
import { LoginForm } from "app/auth/components/LoginForm"

const LoginPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div className="mx-auto mt-8 w-[400px] px-3">
      <pre>
        {JSON.stringify(
          {
            username: "test1@test.com",
            password: "1234567890",
          },
          null,
          2
        )}
      </pre>

      <LoginForm
        onSuccess={(_user) => {
          const next = router.query.next
            ? decodeURIComponent(router.query.next as string)
            : "/communities"
          router.push(next)
        }}
      />
    </div>
  )
}

LoginPage.redirectAuthenticatedTo = "/communities"
LoginPage.getLayout = (page) => <Layout title="Log In">{page}</Layout>

export default LoginPage
