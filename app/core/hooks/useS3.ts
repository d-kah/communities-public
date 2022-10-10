import axios from "axios"
import { getAntiCSRFToken } from "blitz"

const URL_BASE = "https://communities-58zi.onrender.com"

// https://communities-58zi.onrender.com
// http://localhost:3000

export const useS3 = () => {
  const deleteS3 = (cloudId?: string) =>
    new Promise(async (resolve, reject) => {
      if (!cloudId) reject()

      const antiCSRFToken = getAntiCSRFToken()
      if (!antiCSRFToken) reject()

      const { data } = await axios({
        method: "post",
        url: `${URL_BASE}/api/imageStorage/delete`,
        data: { cloudId },
        headers: {
          "anti-csrf": antiCSRFToken,
        },
      })

      resolve(data)
    })

  const copyObjectTemp = (cloudId: string) =>
    new Promise(async (resolve, reject) => {
      const antiCSRFToken = getAntiCSRFToken()
      if (!antiCSRFToken) reject()

      const { data } = await axios({
        method: "post",
        url: `${URL_BASE}/api/imageStorage/persistTemp`,
        data: { cloudId },
        headers: {
          "anti-csrf": antiCSRFToken,
        },
      })

      resolve(data)
    })

  const deleteObjectTemp = (cloudId: string) =>
    new Promise(async (resolve, reject) => {
      const antiCSRFToken = getAntiCSRFToken()
      if (!antiCSRFToken) reject()

      const { data } = await axios({
        method: "post",
        url: `${URL_BASE}/api/imageStorage/deleteTemp`,
        data: { cloudId },
        headers: {
          "anti-csrf": antiCSRFToken,
        },
      })

      resolve(data)
    })

  const persistTempS3 = async (cloudId: string) => {
    await copyObjectTemp(cloudId)
    await deleteObjectTemp(cloudId)
  }

  return { persistTempS3, deleteS3 }
}
