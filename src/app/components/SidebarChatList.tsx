'use client'
import { pusherClient } from '@/lib/pusher'
import { chatHrefConstructor, toPusherKey } from '@/lib/utils'
import { usePathname, useRouter } from 'next/navigation'
import { FC, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import UnseenChatToast from './UnseenChatToast'

interface SidebarChatListProps {
    friends: User[]
    sessionId: string
}

interface ExtendedMessage extends Message {
    senderName: string
    senderImage: string
    chatId: string
    friendId: string
}

const SidebarChatList: FC<SidebarChatListProps> = ({ friends, sessionId }: SidebarChatListProps) => {
    const router = useRouter()
    const pathName = usePathname()
    const [unseenMessages, setUnseenMessages] = useState<{ [key: string]: Message[] }>(() => {
        if (typeof window !== 'undefined') {
            const storedUnseenMessages = localStorage.getItem('unseenMessages');
            return storedUnseenMessages ? JSON.parse(storedUnseenMessages) : {};
        }
        return {};
    });
    const [activeChats, setActiveChats] = useState<User[]>(friends)
    console.log('friends', friends)

    useEffect(() => {
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:chat`))
        pusherClient.subscribe(toPusherKey(`user:${sessionId}:friends`))

        const newFriendHandler = (newFriend: User) => {
            setActiveChats((prev) => [...prev, newFriend])
            router.refresh()
        }

        const messageHandler = (message: ExtendedMessage) => {
            const shouldNotify =
                pathName !== `/dashboard/chat/${chatHrefConstructor(sessionId, message.senderId)}`

            if (!shouldNotify) return

            // Should be notified
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

            const [userId1, userId2] = message.chatId.split('--')
            const friendId = sessionId === userId1 ? userId2 : userId1

            console.log('friendId = ', message.friendId)
            console.log('friendId = ', friendId)

            setUnseenMessages((prev) => {
                const updatedMessages = {
                    ...prev,
                    [friendId]: prev[friendId] ? [...prev[friendId], message] : [message]
                };
                localStorage.setItem('unseenMessages', JSON.stringify(updatedMessages));
                return updatedMessages;
            })
        }

        pusherClient.bind('new_friend', newFriendHandler)
        pusherClient.bind('new_message', messageHandler)

        return () => {
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:chat`))
            pusherClient.unsubscribe(toPusherKey(`user:${sessionId}:friends`))
            pusherClient.unbind('new_friend', newFriendHandler)
            pusherClient.unbind('new_message', messageHandler)
        }
    }, [pathName, sessionId, router])

    useEffect(() => {
        if (pathName?.includes('chat')) {
            const pathname = pathName.split('/').pop() 
            if(!pathname) return 
            const [u1,u2] = pathname?.split('--')
            const chatId = sessionId === u1?u2:u1
            console.log('user1',chatId)
            console.log('pathname',chatId)
            // const chatId = sessionId === user1 ? user2 : user1
            console.log('c',chatId)
            setUnseenMessages((prev) => {
                const newUnseenMessages = { ...prev }
                if (chatId && newUnseenMessages[chatId]) {
                    delete newUnseenMessages[chatId]
                    localStorage.setItem('unseenMessages', JSON.stringify(newUnseenMessages))
                }
                return newUnseenMessages
            })
        }
    }, [sessionId,pathName])
    return (
        <ul role='list' className='max-h-[25rem] overflow-y-auto -mx-2 space-y-1'>
            {friends.sort().map((friend) => {
                const unseenMessageCount = unseenMessages[friend.id]?.length || 0
                return (
                    <li key={friend.id}>
                        <a href={`/dashboard/chat/${chatHrefConstructor(sessionId, friend.id)}`} className='text-gray-700 hover:text-indigo-600 hover:bg-gray-50 group flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                            {friend.name}
                            {unseenMessageCount > 0 ? (
                                <div className='bg-indigo-600 font-medium text-xs text-white w-4 h-4 rounded-full flex justify-center items-center'>
                                    {unseenMessageCount}
                                </div>
                            ) : null}
                        </a>
                    </li>
                )
            })}
        </ul>
    )
}

export default SidebarChatList
