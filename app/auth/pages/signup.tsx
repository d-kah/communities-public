import { useRouter, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import { SignupForm } from "app/auth/components/SignupForm"

const SignupPage: BlitzPage = () => {
  const router = useRouter()

  return (
    <div className="mx-auto mt-8 w-[400px] px-3">
      <SignupForm onSuccess={() => router.push(Routes.CommunitiesPage())} />
    </div>
  )
}

SignupPage.redirectAuthenticatedTo = "/communities"
SignupPage.getLayout = (page) => <Layout title="Sign Up">{page}</Layout>

export default SignupPage
