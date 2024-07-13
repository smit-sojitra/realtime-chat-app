'use client'
import axios from 'axios'
import { Check, UserPlus, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'

interface FriendRequestProps {
    incomingFriendRequests: IncomingFriendRequest[]
    sessionId: string
}

const FriendRequest: FC<FriendRequestProps> = ({ incomingFriendRequests, sessionId }: FriendRequestProps) => {
    const [friendRequests, setFriendRequests] = useState<IncomingFriendRequest[]>(incomingFriendRequests)
    const router = useRouter()
    const acceptFriend = async (senderId: string) => {
        try {
            await axios.post('/api/friends/accept',{id:senderId})
            setFriendRequests((prev) =>
                prev.filter((request)=>request.senderId!==senderId)
            )
            router.refresh()  
        } catch (error) {
           console.log('Error accepting request',error) 
        }
    }
    const denyFriend = async (senderId: string) => {
        try {
            await axios.post('/api/friends/deny',{id:senderId})
            setFriendRequests((prev) =>
                prev.filter((request)=>request.senderId!==senderId)
            )
            router.refresh()  
        } catch (error) {
           console.log('Error denying request',error) 
        }

    }
    return (
        <div>
            {
                friendRequests.length === 0 ? (<p>No friend request...</p>) : (
                    friendRequests.map((friend) => (
                        <div key={friend.senderId} className='flex py-2 gap-4 items-center'>
                            <UserPlus className='text-black' />
                            <p className='font-medium text-lg'>{friend.senderEmail}</p>
                            <button
                                onClick={() => acceptFriend(friend.senderId)}
                                aria-label='accept friend'
                                className='w-8 h-8 bg-indigo-600 hover:bg-indigo-700 grid place-items-center rounded-full transition hover:shadow-md'>
                                <Check className='font-semibold text-white w-3/4 h-3/4' />
                            </button>

                            <button
                                onClick={() => denyFriend(friend.senderId)}
                                aria-label='deny friend'
                                className='w-8 h-8 bg-red-600 hover:bg-red-700 grid place-items-center rounded-full transition hover:shadow-md'>
                                <X className='font-semibold text-white w-3/4 h-3/4' />
                            </button>
                        </div>
                    ))
                )
            }
        </div>
    )
}

export default FriendRequest