import { Image, Link, BlitzPage, RedirectError, AuthenticationError } from "blitz"
import Layout from "app/core/layouts/Layout"

const Home: BlitzPage = () => {
  return (
    <div className="container mx-auto">
      <main>
        <p>Home</p>
      </main>
    </div>
  )
}

Home.authenticate = false
Home.suppressFirstRenderFlicker = true
Home.getLayout = (page) => <Layout title="Home">{page}</Layout>

export default Home
