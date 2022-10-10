import { createContext, Suspense } from "react"
import {
  Head,
  Link,
  useRouter,
  useQuery,
  useMutation,
  useParam,
  BlitzPage,
  Routes,
  Router,
  AuthorizationError,
  AuthenticationError,
  RedirectError,
} from "blitz"
import Layout from "app/core/layouts/Layout"
import getCommunityAuth from "app/communities/queries/getCommunityAuth"
import updateCommunity from "app/communities/mutations/updateCommunity"
import { CommunitySchema, CommunityUpdateSchema } from "app/communities/validations"
import { CommunityForm, FORM_ERROR } from "app/communities/components/CommunityForm"
import { z } from "zod"
import { FormApi } from "final-form"
import { FormProps as FinalFormProps } from "react-final-form"
import { useImageStorage } from "app/core/hooks/useImageStorage"

export const EditCommunity = () => {
  const router = useRouter()
  const communityId = useParam("communityId", "number")
  const [community, { setQueryData }] = useQuery(
    getCommunityAuth,
    { id: communityId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateCommunityMutation] = useMutation(updateCommunity)
  const { handleImagesCommunity } = useImageStorage()

  return (
    <>
      <Head>
        <title>Edit Community {community.id}</title>
      </Head>

      <CommunityForm
        title="Edit Community"
        submitText="Update Community"
        schema={CommunityUpdateSchema}
        initialValues={community}
        onSubmit={async (values) => {
          await handleImagesCommunity(values.images)

          try {
            const updated = await updateCommunityMutation(values)
            await setQueryData(updated)
            router.push(Routes.ShowCommunityPage({ communityId: updated.id }))
          } catch (error: any) {
            console.error(error)
            return {
              [FORM_ERROR]: error.toString(),
            }
          }
        }}
      />
    </>
  )
}

const EditCommunityPage: BlitzPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EditCommunity />
    </Suspense>
  )
}

EditCommunityPage.authenticate = true
EditCommunityPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditCommunityPage
