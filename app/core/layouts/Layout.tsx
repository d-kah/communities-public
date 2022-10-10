import logout from "app/auth/mutations/logout"
import { Head, BlitzLayout, Link, Routes, useMutation } from "blitz"
import { Suspense } from "react"
import { useCurrentUser } from "../hooks/useCurrentUser"

const UserInfo = () => {
  const currentUser = useCurrentUser()
  const [logoutMutation] = useMutation(logout)

  if (currentUser) {
    return (
      <div className="flex">
        <div className="mr-6 flex items-center">
          <span className="mr-3">
            User id: <code>{currentUser.id}</code>
          </span>
          <span>
            Role: <code>{currentUser.role}</code>
          </span>
        </div>
        <button
          className="button small"
          onClick={async () => {
            await logoutMutation()
          }}
        >
          Logout
        </button>
      </div>
    )
  } else {
    return (
      <div className="mr-4">
        <Link href={Routes.SignupPage()}>
          <a className="button small p-3">
            <strong>Sign Up</strong>
          </a>
        </Link>
        <Link href={Routes.LoginPage()}>
          <a className="button small p-3">
            <strong>Login</strong>
          </a>
        </Link>
      </div>
    )
  }
}

const Layout: BlitzLayout<{ title?: string }> = ({ title, children }) => {
  return (
    <>
      <Head>
        <title>{title || "communities"}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="fixed z-50 top-0 h-[64px] bg-white w-full flex justify-between items-center p-3 tracking-wide border-b border-gray-300 text-sm">
        <div className="ml-2 font-bold text-slate-800">
          <div className="text-lg">
            <Link href="/communities">
              <a>Communities</a>
            </Link>
          </div>
        </div>

        <Suspense fallback="Loading...">
          <UserInfo />
        </Suspense>
      </div>

      {children}
    </>
  )
}

export default Layout
