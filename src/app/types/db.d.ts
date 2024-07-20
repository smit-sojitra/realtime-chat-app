type User = {
    id: string 
    name: string 
    image: string 
    email: string 
    unseen:number
}

interface Message{
    id:string,
    senderId:string
    receiverId:string
    text:string
    timestamp:number
    friendId:string
}
interface Chat{
    id:string
    messages:Message[]
}
interface FriendRequest{
    id:string
    senderId:string
    receiverId:string
}
