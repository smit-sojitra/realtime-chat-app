import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "../../auth/[...nextauth]/options";
import {z} from "zod"
import { nanoid } from 'nanoid'
import { fetchRedis } from "@/helpers/redis";
import { Message, messageValidator } from "@/lib/validattions/message";
import { pusherServer } from "@/lib/pusher";
import { toPusherKey } from "@/lib/utils";

export async function POST(req:Request){
    try {
        const {chatId,text}:{chatId:string,text:string} = await req.json()
        const session = await getServerSession(authOptions);
        if(!session){
            return new NextResponse ('Unauthorized access',{status:401})
        }
       const[userId1,userId2] = chatId.split('--');
       if(session.user.id !== userId1 && session.user.id !==userId2){
        return new NextResponse ('Unauthorized access',{status:402})
       }
       const friendId = session.user.id === userId1 ? userId2 : userId1
       const friendList = (await fetchRedis(
        'smembers',
        `user:${session.user.id}:friends`
      )) as string[]
      const isFriend = friendList.includes(friendId)
      if(!isFriend){
        return new NextResponse ('Unauthorized access',{status:400})
      }
      const rawSender = (await fetchRedis(
        'get',
        `user:${session.user.id}`
      )) as string
      const sender = await JSON.parse(rawSender) as User
      const timestamp = Date.now();
      const messageData:Message = {
        id:nanoid(),
        senderId: session.user.id,
        text,
        timestamp,
      }
      const message = messageValidator.parse(messageData)
      // trigger message
      pusherServer.trigger(toPusherKey(`chat:${chatId}`),'incoming-message',message)
      // all valid, send the message
      pusherServer.trigger(toPusherKey(`user:${friendId}:chat`),
                                    'new_message',
                                    {
                                      ...message,
                                      chatId:chatId,
                                      friendId:friendId,
                                      senderName:sender.name,
                                      senderImage:sender.image
                                    }
                                  )
      pusherServer.trigger(toPusherKey(`chat:${friendId}`),
                            'dashboard',
                            {}
    )
        await db.zadd(`chat:${chatId}:messages`, {
            score: timestamp,
            member: JSON.stringify(message),
        })
        return new NextResponse('ok')
    } catch (error) {
        console.log('Error while sending message',error)
        if(error instanceof z.ZodError){
            return new NextResponse('Invalid request payload',{status:422});
        }
        return new NextResponse('Invalid request',{status:400});
    }
    
}