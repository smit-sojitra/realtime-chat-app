'use client'
import { fetchRedis } from '@/helpers/redis'
import { pusherClient } from '@/lib/pusher'
import { toPusherKey } from '@/lib/utils'
import { User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'

interface FriendRequestSidebarOptionProps {
    initialRequestCount:number
    sessionId:string
}

    const FriendRequestSidebarOption: FC<FriendRequestSidebarOptionProps> = ({initialRequestCount,sessionId}:FriendRequestSidebarOptionProps) => {
    const [unseenRequestCount,setUnseenRequestCount] = useState<number>(initialRequestCount)
    const router = useRouter()

    useEffect(()=>{
      const friendRequestHandler = ()=>{
          setUnseenRequestCount((prev)=>prev+1)
      }
      const friendCountHandler =()=>{
        setUnseenRequestCount((prev)=>prev-1)
      }
      pusherClient.subscribe(toPusherKey(`user:${sessionId}:incomming_friend_request`))
      pusherClient.bind('incomming_friend_request',friendRequestHandler)
      pusherClient.subscribe(toPusherKey(`user:${sessionId}:incomming_friend_request_count`))
      pusherClient.bind('incomming_friend_request_count',friendCountHandler)
          
      return ()=>{
          pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incomming_friend_request`))
          pusherClient.unbind('incomming_friend_request',friendRequestHandler)
          pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:incomming_friend_request`))
          pusherClient.unbind('incomming_friend_request_count',friendCountHandler)
      }
  },[sessionId])  
    
  return(
    <Link
      href='/dashboard/requests'
      className='text-gray-700 p-2 duration-300 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md  text-sm leading-6 font-semibold'>
      <div className='text-gray-400 duration-300 border-gray-200 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium bg-white'>
        <User className='h-4 w-4' />
      </div>
      <p className='truncate'>Friend requests</p>

      {unseenRequestCount > 0 ? (
        <div className='rounded-full w-5 h-5 text-xs flex justify-center items-center text-white bg-indigo-600'>
          {unseenRequestCount}
        </div>
      ) : null}
    </Link>
  )
}

export default FriendRequestSidebarOption