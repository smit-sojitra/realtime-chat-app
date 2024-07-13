import { User,Session } from "next-auth";
import { JWT } from "next-auth/jwt";
type userId = string
declare module 'next-auth'{
    interface Session{
        user:User & {
            id:userId
            email:string
        }
    }
}
declare module 'next-auth/jwt'{
    interface JWT{
        id:string;
    }
}
