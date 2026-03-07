import { useServerAuth } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  return useServerAuth().handler(toWebRequest(event))
})
