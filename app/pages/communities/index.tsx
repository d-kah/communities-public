import { Suspense, useState } from "react"
import { Head, Link, usePaginatedQuery, useRouter, BlitzPage, Routes, dynamic } from "blitz"
import Layout from "app/core/layouts/Layout"
import getCommunities from "app/communities/queries/getCommunities"
import CommunityListItem from "app/communities/components/CommunityListItem"
import { BsMap, BsMapFill } from "react-icons/bs"
import classNames from "classnames"

const CommunitiesMap = dynamic(() => import("app/communities/components/CommunitiesMap"), {
  ssr: false,
})

const ITEMS_PER_PAGE = 8

export const CommunitiesList = () => {
  const router = useRouter()
  const page = Number(router.query.page) || 0
  const [{ communities, hasMore }] = usePaginatedQuery(getCommunities, {
    orderBy: { id: "asc" },
    skip: ITEMS_PER_PAGE * page,
    take: ITEMS_PER_PAGE,
  })
  const [isMap, setIsMap] = useState(false)

  const goToPreviousPage = () => router.push({ query: { page: page - 1 } })
  const goToNextPage = () => router.push({ query: { page: page + 1 } })

  const pagination = (
    <div className="flex">
      <button
        disabled={page === 0}
        onClick={goToPreviousPage}
        className="mr-2 block w-full p-4 hover:underline ease-in-out duration-300 cursor-pointer"
      >
        Previous
      </button>
      <button
        disabled={!hasMore}
        onClick={goToNextPage}
        className="ml-2 block w-full p-4  hover:underline ease-in-out duration-300 cursor-pointer"
      >
        Next
      </button>
    </div>
  )

  return (
    <div className="grow h-full">
      <div className="flex h-full">
        <div className="w-full lg:w-1/2">
          <div className="flex flex-col h-full">
            <div className="flex flex-col h-full">
              <div className="bg-white border-b border-gray-300 top-[64px] sticky z-50 flex justify-end items-center px-6 py-4">
                <button className="lg:hidden mr-auto" onClick={() => setIsMap((isMap) => !isMap)}>
                  {isMap ? <BsMapFill className="h-6 w-6" /> : <BsMap className="h-6 w-6" />}
                </button>

                <Link href={Routes.NewCommunityPage()}>
                  <a className="ease-in-out hover:no-underline duration-300 bg-slate-700 hover:bg-slate-800 rounded py-2.5 px-4 text-white inline-block">
                    Create Community
                  </a>
                </Link>
              </div>

              <div className="h-full overflow-hidden lg:hidden">
                <div
                  className={classNames(
                    { "-translate-x-1/2": isMap },
                    "flex w-[200%] duration-300 ease-in-out h-full"
                  )}
                >
                  <div className="w-full h-full overflow-hidden">
                    <div className="w-full h-full overflow-y-scroll">
                      <div className="flex flex-wrap content-start">
                        {communities.map((community, index) => (
                          <CommunityListItem
                            key={`${community.id}${index}`}
                            community={community}
                          />
                        ))}
                      </div>
                      {pagination}
                    </div>
                  </div>
                  <div className="w-full h-full bg-blue-200">
                    <CommunitiesMap communities={communities} />
                  </div>
                </div>
              </div>

              <div className="h-full hidden lg:block">
                <div className="flex flex-wrap">
                  {communities.map((community, index) => (
                    <CommunityListItem key={`${community.id}${index}`} community={community} />
                  ))}
                </div>
                {pagination}
              </div>
            </div>
          </div>
        </div>
        <div className="grow">
          <div className="fixed h-full map-wrapper w-full">
            <CommunitiesMap communities={communities} />
          </div>
        </div>
      </div>
    </div>
  )
}

const CommunitiesPage: BlitzPage = () => {
  return (
    <>
      <Head>
        <title>Communities</title>
      </Head>

      <Suspense fallback={<div>Loading...</div>}>
        <CommunitiesList />
      </Suspense>
    </>
  )
}

// CommunitiesPage.authenticate = false
CommunitiesPage.getLayout = (page) => <Layout>{page}</Layout>

export default CommunitiesPage
