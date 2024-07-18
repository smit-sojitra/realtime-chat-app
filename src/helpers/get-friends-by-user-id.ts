import { fetchRedis } from "./redis"

export const getFriedsByUserId = async (userId:string)=>{
    const friendsIds = (await fetchRedis(
        'smembers',
        `user:${userId}:friends`
      )) as string[]
      
      if(!Array.isArray(friendsIds)){
        return[]
      }
        const friends = await Promise.all(
            friendsIds.map(async (friendId)=>{
                const friend = await fetchRedis('get',`user:${friendId}`) as string
                const parsedFriend = JSON.parse(friend) as User
                return parsedFriend
            })
        )
        return friends
}