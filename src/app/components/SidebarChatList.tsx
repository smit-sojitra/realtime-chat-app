'use client'
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import {  usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}
interface ExtendedMessage extends Message{
    senderName:string
    senderImage:string
}
const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }: SidebarChatListProps) => {
    const router = useRouter()
    const pathName = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<Message[]>([])
    const [activeChats, setActiveChats] = useState<User[]>(friends)
    console.log('friends',friends)
    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chat`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))
        const newFriendHandler = (newFriend:User) =>{
            setActiveChats((prev)=>[...prev,newFriend])
            router.refresh()
        }
        const messageHandler = (message:ExtendedMessage) =>{
            const shouldNotify =
            pathName !==
        `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`
        
        if (!shouldNotify) return
        // should be notified
        toast.custom((t) => (
            <UnseenChatToast
            t={t}
            sessionId={sessionId}
            senderId={message.senderId}
            senderImg={message.senderImage}
            senderMessage={message.text}
            senderName={message.senderName}
            />
        ))
        setUnseenMessages((prev)=>[...prev,message])
    }
    pusherClient.bind('new_friend',newFriendHandler)
    pusherClient.bind('new_message',messageHandler)
    return ()=>{
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chat`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
            pusherClient.unbind('new_frriend',newFriendHandler)
            pusherClient.unbind('new_message',messageHandler)
        }
    }, [pathName,sessionId,router])
    useEffect(() => {
        if (pathName?.includes('chat')) {
          setUnseenMessages((prev) => {
            return prev.filter((msg) => !pathName.includes(msg.senderId))
          })
        }
      }, [pathName])
    return (
        <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
            {
                friends.sort().map((friend) => {
                    const unseenMessageCount = unseenMessages.map((unseenMsg) => {
                        return unseenMsg.senderId === friend.id
                    }).length
                    return <li key={friend.id}>
                        <a href={`/dashboard/chat/${chatHrefConstructor(sessionId,friend.id)}`} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                            {friend.name}
                            {unseenMessageCount > 0 ? (
                                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                                    {unseenMessageCount}
                                </div>
                            ) : null}
                        </a>
                    </li>
                })
            }
        </ul>
    )
}

export default SidebarChatList