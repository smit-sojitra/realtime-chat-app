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
       const { id:idToDeny } = await req.json();
       if(!session){
        return new NextResponse ('Unauthorized access',{status:401})
       } 
       pusherServer.trigger(toPusherKey(`user:${session.user.id}:friends`),
                            'new_friend',
                            {}
                        )
      await db.srem(`user:${session.user.id}:incomming_friend_request`,idToDeny)
      return new NextResponse ('ok')
    } catch (error) {
        console.log('Error denying request',error)
        if(error instanceof z.ZodError){
            return new NextResponse('Invalid request payload',{status:422});
        }
        return new NextResponse('Invalid request',{status:400});
    }
}