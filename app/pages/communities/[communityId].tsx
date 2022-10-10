import { Suspense } from "react"
import {
  Head,
  useRouter,
  useQuery,
  useParam,
  BlitzPage,
  Image,
  useMutation,
  Routes,
  dynamic,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getCommunity from "app/communities/queries/getCommunity"
import deleteCommunity from "app/communities/mutations/deleteCommunity"
import { useCurrentUser } from "app/core/hooks/useCurrentUser"
import { useImageStorage } from "app/core/hooks/useImageStorage"
import classNames from "classnames"

const CommunityMap = dynamic(() => import("app/communities/components/CommunityMap"), {
  ssr: false,
})

export const Community = () => {
  const router = useRouter()
  const communityId = useParam("communityId", "number")
  const [deleteCommunityMutation] = useMutation(deleteCommunity)
  const [community] = useQuery(getCommunity, { id: communityId })
  const currentUser = useCurrentUser()
  const { deleteImages } = useImageStorage()
  const isUserCommunityAuthor = currentUser?.id === community.userId

  return (
    <>
      <Head>
        <title>Community {community.id}</title>
      </Head>

      <div className="w-[530px] px-3 pb-[30px] mx-auto">
        <div className="flex items-baseline justify-between my-6">
          <div>
            <a onClick={() => router.push(Routes.CommunitiesPage())}>
              <span>&#60;</span> Back
            </a>
          </div>

          <div>
            <button
              className={"link-underline ml-3"}
              disabled={!isUserCommunityAuthor}
              type="button"
              onClick={async () => {
                await router.push(Routes.EditCommunityPage({ communityId: community.id }))
              }}
            >
              Edit
            </button>

            <button
              className={"link-underline ml-3"}
              disabled={!isUserCommunityAuthor}
              type="button"
              onClick={async () => {
                if (window.confirm("This will be deleted")) {
                  await deleteCommunityMutation({ id: community.id })
                  deleteImages(community.images.map((image) => image.cloudId))
                  await router.push(Routes.CommunitiesPage())
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>

        <h1 className="my-4 text-2xl">{community.name}</h1>

        <div className="flex">
          <div className="w-full">
            <CommunityMap community={community} />

            <div className="grid grid-cols-4 gap-4">
              {community.images.map((image, index) => (
                <div
                  key={image.uuid}
                  className={classNames("relative", {
                    "col-span-2 row-span-2": index === 0,
                  })}
                >
                  <img
                    src={image.cloudUrl ?? undefined}
                    // Revoke data uri after image is loaded
                    onLoad={() => image.previewUrl && URL.revokeObjectURL(image.previewUrl)}
                    className="block w-full h-full rounded"
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="hidden xl:block w-1/2 px-6 absolute left-full text-sm">
            <pre>{JSON.stringify(community, null, 2)}</pre>
          </div>
        </div>
      </div>
    </>
  )
}

const ShowCommunityPage: BlitzPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <Community />
      </Suspense>
    </div>
  )
}

ShowCommunityPage.authenticate = false
ShowCommunityPage.getLayout = (page) => <Layout>{page}</Layout>

export default ShowCommunityPage
