import { BlitzConfig, sessionMiddleware, simpleRolesIsAuthorized } from "blitz"

const config: BlitzConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/communities",
        permanent: true,
      },
    ]
  },
  middleware: [
    sessionMiddleware({
      cookiePrefix: "communities",
      isAuthorized: simpleRolesIsAuthorized,
    }),
  ],
  /* Uncomment this to customize the webpack config
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Note: we provide webpack above so you should not `require` it
    // Perform customizations to webpack config
    // Important: return the modified config
    return config
  },
  */
  images: {
    domains: [process.env.AWS_BUCKET_URL ? process.env.AWS_BUCKET_URL : ""],
  },
}
module.exports = config
