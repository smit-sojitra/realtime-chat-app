'use client'
import { Loader2, LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FC, useState } from 'react'

interface SignOutButtonProps {
  
}

const SignOutButton: FC<SignOutButtonProps> = ({}) => {
  
    const [isSigningOut, setSigningOut] = useState(false);
    const router = useRouter()
    const logOut = async ()=>{
        setSigningOut(true)
        try {
            await signOut();
            router.replace('/login')
        } catch (error) {
            console.log('Erorr siging out')
        }finally{
          setSigningOut(false)
        }
    }
  return <div>
    {
        isSigningOut?<Loader2 className='animate-spin w-4 h-4 '/>:(
          <Link href={'/login'}>
            <LogOut onClick={()=>logOut()} />
          </Link>
        )
    }
  </div>
}

export default SignOutButton