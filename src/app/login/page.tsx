'use client'
import { signIn } from 'next-auth/react'
import { FC } from 'react'

interface pageProps {
  
}
 const getData = async ()=>{
    try {
        await signIn('google');
    } catch (error) {
        console.log('error',error);
    }
 }
const page: FC<pageProps> = ({}) => {
  return <button onClick={getData}>click</button>
}

export default page