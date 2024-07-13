'use client'
import { addFriendValidator } from "@/lib/validattions/add-friends"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useState } from "react";
import { useForm } from "react-hook-form"; 

import {z} from "zod"

type FormData = z.infer<typeof addFriendValidator>
const page = () => {
    const [showSuccessState, setShowSuccessState] = useState<Boolean>(false);
    const [isSending, setIsSending] = useState<Boolean>(false);
    const { handleSubmit, register, setError, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(addFriendValidator),
      });
    const addFriend = async(email:string) =>{
        setIsSending(true)
        try {
            const validatedEmail = addFriendValidator.parse({email})
            const response = await axios.post('/api/friends/add',{
                email:validatedEmail
            })
            console.log('res:',response);
            setShowSuccessState(true);
        } catch (error) {
            if(error instanceof z.ZodError){
                setError('email',{message:error.message})
                return
            }
            if(error instanceof AxiosError){
                setError('email',{message:error.response?.data})
                return
            }
            setError('email',{message:'Something went wrong'})
        }finally{
            setIsSending(false);
        }
    }
    const onSubmit = async(data:FormData)=>{
        addFriend(data.email)
    }
  return(
    <form onSubmit={handleSubmit(onSubmit)}>
        <label htmlFor="email">Add friend br email</label>
        <div>
            <input {...register('email')} type="text" placeholder="you@example.com" />
            <button>send</button>
        </div>
        <p>{errors.email?.message}</p>
        {
            isSending?(<p>sending...</p>):((!errors.email?.message && showSuccessState)?(
                <p className='mt-1 text-sm text-green-600'>Friend request sent!</p>
            ):null)
            
        }
    </form>
  )
}
export default page