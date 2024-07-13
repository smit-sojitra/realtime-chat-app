import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { Icon, Icons } from '@/app/components/Icons'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC,ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SignOutButton from '@/app/components/SignOutButton'
import FriendRequestSidebarOption from '@/app/components/FriendRequestSidebarOption'
import { fetchRedis } from '@/helpers/redis'
// import { Image } from 'lucide-react'
interface LayoutProps {
   children:ReactNode
}
interface SidebarOptions{
    name:string
    image:Icon
    id:number
    href:string
}
const SidebarOptions: SidebarOptions[] = [
    {
        id:1,
        name:'Add a friend',
        href:'/dashboard/add',
        image:'UserPlus'
    }
]

const Layout  = async ({children}:LayoutProps) => {
    const session = await getServerSession(authOptions);
    if(!session) notFound();
    const initialRequestCount = (await fetchRedis('smembers',`user:${session.user.id}:incomming_friend_request`)as User[]).length
    console.log('incomming_friend_request',initialRequestCount)

  return <div className='w-full h-screen flex'>
        <div className='max-w-xs flex grow flex-col w-full h-full gap-y-5 overflow-y-auto border-r border-gray-200'>
            <p className='text-center py-5'>Your chats</p>
            <div className='text-xs ml-3 font-semibold leading-6 text-gray-400'>
                Overview
            </div>
            <div>
                {
                    SidebarOptions.map((option)=>{
                        const Icon = Icons[option.image]
                        return(
                            <div key={option.id}>
                                <Link
                                    href={option.href}
                                    className='text-gray-700 duration-300 hover:text-indigo-600 hover:bg-gray-50 group flex gap-3 rounded-md p-2 text-sm leading-6 font-semibold'>
                                    <span className='text-gray-400 border-gray-200 duration-300 group-hover:border-indigo-600 group-hover:text-indigo-600 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem]  font-medium bg-white'>
                                    <Icon className='h-4 w-4' />
                                    </span>

                                    <span className='truncate'>{option.name}</span>
                                </Link>
                            </div>
                        )
                    })
                }
                <FriendRequestSidebarOption initialRequestCount={initialRequestCount} sessionId={session.user.id}/>
              </div>
              <li className='mt-auto flex px-2 items-center'>
              <div className='flex flex-1 gap-x-4  py-3 text-sm font-semibold leading-6 text-gray-900'>
                <div className='relative h-8 w-8 bg-gray-50'>
                  <Image
                    fill
                    className='rounded-full'
                    src={session.user.image || ''}
                    alt='Your profile picture'
                  />
                </div>

                <span className='sr-only'>Your profile</span>
                <div className='flex flex-col'>
                  <span aria-hidden='true'>{session.user.name}</span>
                  <span className='text-xs text-zinc-400' aria-hidden='true'>
                    {session.user.email}
                  </span>
                </div>
              </div>
              <SignOutButton/> 
              </li>
        </div>
    {children}
    </div>
}

export default Layout