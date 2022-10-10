import { useRouter, useMutation, BlitzPage, Routes } from "blitz"
import Layout from "app/core/layouts/Layout"
import createCommunity from "app/communities/mutations/createCommunity"
import { CommunityForm, FORM_ERROR } from "app/communities/components/CommunityForm"
import { useImageStorage } from "app/core/hooks/useImageStorage"
import { CommunityCreateSchema } from "app/communities/validations"

const NewCommunityPage: BlitzPage = () => {
  const router = useRouter()
  const [createCommunityMutation] = useMutation(createCommunity)
  const { handleImagesCommunity } = useImageStorage()

  return (
    <CommunityForm
      title="Create New Community"
      submitText="Create Community"
      schema={CommunityCreateSchema}
      onSubmit={async (values) => {
        await handleImagesCommunity(values.images)

        try {
          const community = await createCommunityMutation(values)

          router.push(Routes.ShowCommunityPage({ communityId: community.id }))
        } catch (error: any) {
          console.error(error)
          return {
            [FORM_ERROR]: error.toString(),
          }
        }
      }}
    />
  )
}

NewCommunityPage.authenticate = { redirectTo: "/login" }
NewCommunityPage.getLayout = (page) => <Layout title={"Create New Community"}>{page}</Layout>

export default NewCommunityPage
