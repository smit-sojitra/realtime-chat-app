import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import {z} from "zod"
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
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
        
      console.log('firsthas',isAlreadyFriends)
      if (isAlreadyFriends) {
        return new NextResponse ('Already friends', { status: 400 })
      }
      const hasFriendRequest = await fetchRedis(
        'sismember',
        `user:${session.user.id}:incomming_friend_request`,
        idToAdd
    )
    console.log('hs',hasFriendRequest)
      if (!hasFriendRequest) {
        return new NextResponse('Invalid friend request', { status: 402 })
      }
      await db.sadd(`user:${session.user.id}:friends`,idToAdd)
      await db.sadd(`user:${idToAdd}:friends`,session.user.id)
      await db.srem(`user:${session.user.id}:incomming_friend_request`,idToAdd)
      return new NextResponse ('ok')
    } catch (error) {
        console.log('Error accepting request',error)
        if(error instanceof z.ZodError){
            return new NextResponse('Invalid request payload',{status:422});
        }
        return new NextResponse('Invalid request',{status:500});
    }
}