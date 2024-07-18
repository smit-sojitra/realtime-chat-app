import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";
import { NextResponse } from "next/server";
import { addFriendValidator } from "@/lib/validattions/add-friends";
import { fetchRedis } from "@/helpers/redis";
import { db } from "@/lib/db";
import {z} from 'zod'
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";
export async function POST(req:Request){
    try {
        const body = await req.json();
        const session = await getServerSession(authOptions);
        if(!session){
            return new NextResponse('Unauthorized access',{status:401})
        }
        const {email: emailToAdd} = addFriendValidator.parse(body.email);
        const idToAdd = await fetchRedis('get',`user:email:${emailToAdd}`) as string
        if(!idToAdd){
            return new NextResponse('This person does not exist',{status:404})
        }
        if(idToAdd === session.user.id){
            return new NextResponse('Can not add yourself as a friend',{status:400})
        }
        const isAlreadyAdded = await fetchRedis('sismember',`user:${idToAdd}:incomming_friend_request`,session.user.id)
        if(isAlreadyAdded){
            return new NextResponse('Already send friend request',{status:400})
        }
        const isAlreadyFriends = await fetchRedis('sismember',`user:${session.user.id}:friends`,idToAdd)
        if(isAlreadyFriends){
            return new NextResponse('User is already a friend',{status:400});
        }
        pusherServer.trigger(toPusherKey(`user:${idToAdd}:incomming_friend_request`),
                                                    'incomming_friend_request',
                                                    {
                                                        senderId:session.user.id,
                                                        senderEmail:session.user.email
                                                    }
                                                )
            
        db.sadd(`user:${idToAdd}:incomming_friend_request`,session.user.id)
        return new NextResponse('Friend request send successfully');
    } catch (error) {
        console.log('error',error)
        if(error instanceof z.ZodError){
            return new NextResponse('Invalid request payload',{status:422});
        }
        return new NextResponse('Invalid request',{status:400});
    }
}