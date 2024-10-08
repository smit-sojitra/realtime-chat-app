import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import {z} from "zod"
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
export async function POST(req:Request){
    try {
       const session = await getServerSession(authOptions);
    //    const body = await req.json()
    //    const { id:idToAdd } = z.object({id:z.string()}).parse(body);
       const { id:idToAdd } = await req.json();
       if(!session){
        return new NextResponse ('Unauthorized access',{status:401})
       } 
       const isAlreadyFriends = await fetchRedis(
        'sismember',
        `user:${session.user.id}:friends`,
        idToAdd
      )
      if (isAlreadyFriends) {
        return new NextResponse ('Already friends', { status: 400 })
      }
      const hasFriendRequest = await fetchRedis(
        'sismember',
        `user:${session.user.id}:incomming_friend_request`,
        idToAdd
    )
      if (!hasFriendRequest) {
        return new NextResponse('Invalid friend request', { status: 402 })
      }
      const[rawUser,rawFriend] = await Promise.all([
        fetchRedis('get',`user:${session.user.id}`),
        fetchRedis('get',`user:${idToAdd}`),
      ]) as [string,string]

      const user = await JSON.parse(rawUser) as User;
      const friend = await JSON.parse(rawFriend) as User;
      
      await Promise.all([
        pusherServer.trigger(toPusherKey(`user:${idToAdd}:friends`),
                                  'new_friend',
                                  {user}
                              ),
        pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`),
                                  'new_friend',
                                  {friend}
                              ),
        db.sadd(`user:${session.user.id}:friends`,idToAdd),
        db.sadd(`user:${idToAdd}:friends`,session.user.id),
        db.srem(`user:${session.user.id}:incomming_friend_request`,idToAdd),
        db.srem(`user:${idToAdd}:incomming_friend_request`,session.user.id),
      ])

      
      return new NextResponse ('ok')
    } catch (error) {
        console.log('Error accepting request',error)
        if(error instanceof z.ZodError){
            return new NextResponse('Invalid request payload',{status:422});
        }
        return new NextResponse('Invalid request',{status:500});
    }
}