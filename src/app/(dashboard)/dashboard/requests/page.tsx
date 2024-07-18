import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import FriendRequest from '@/app/components/FriendRequest';
import { fetchRedis } from '@/helpers/redis'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation';

const page = async () => {
  const session = await getServerSession(authOptions);
  if(!session) notFound()
  const incomingSenderIds = await fetchRedis('smembers',`user:${session.user.id}:incomming_friend_request`) as string[]
  const incomingFriendRequests = await Promise.all(
    incomingSenderIds.map(async(senderId)=>{
      const sender = await fetchRedis('get',`user:${senderId}`) as string
      const parsedEmail = await JSON.parse(sender) 
      return{
        senderId,
        senderEmail:parsedEmail.email
      }
    })
  )
  return (
    <main className='pt-8'>
      <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
      <div className='flex flex-col gap-4'>
        <FriendRequest
          incomingFriendRequests={incomingFriendRequests}
          sessionId={session.user.id}
        />
      </div>
    </main>
  )
}

export default page