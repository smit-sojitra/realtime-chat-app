'use client'
import AddFriendButton from "@/app/components/AddFriendButton";
import { addFriendValidator } from "@/lib/validattions/add-friends"
import { zodResolver } from "@hookform/resolvers/zod"
import axios, { AxiosError } from "axios"
import { useState } from "react";
import { useForm } from "react-hook-form"; 
import toast from "react-hot-toast";

import {z} from "zod"

type FormData = z.infer<typeof addFriendValidator>
const Page = () => {
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
            setShowSuccessState(true);
            console.log('add',response)
            toast.success(response.data)
        } catch (error) {
            if(error instanceof z.ZodError){
                setError('email',{message:error.message})
                return
            }
            if(error instanceof AxiosError){
                setError('email',{message:error.response?.data})
                return
            }
            toast.error('something went wrong')
            setError('email',{message:'Something went wrong'})
        }finally{
            setIsSending(false);
        }
    }
    const onSubmit = async(data:FormData)=>{
        addFriend(data.email)
    }
    
  return(
    <main className='pt-8'>
      <h1 className='font-bold text-5xl mb-8'>Add a friend</h1>
      <AddFriendButton />
    </main>
  )
}
export default Page