
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import Dashboard from '@/app/components/Dashboard'
import { getFriedsByUserId } from '@/helpers/get-friends-by-user-id'
import { fetchRedis } from '@/helpers/redis'
import { chatHrefConstructor } from '@/lib/utils'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'


const page = async() => {
  const session = await getServerSession(authOptions)
  if(!session) notFound()
  const friends = await getFriedsByUserId(session.user.id)
  const friendsWithLastMessage = await Promise.all(
    friends.map(async (friend)=>{
      const [lastMesageRaw] = (await fetchRedis('zrange',`chat:${chatHrefConstructor(session.user.id,friend.id)}:messages`,-1,-1)) as string[]
      const lastMessage = JSON.parse(lastMesageRaw) as Message
      return {
        ...friend,
        lastMessage,
      }
    })
  )
  return (
    <Dashboard friendsWithLastMessage={friendsWithLastMessage} session={session}/>

  )
}

export default page