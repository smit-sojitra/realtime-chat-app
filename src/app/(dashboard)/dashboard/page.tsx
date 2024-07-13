'use client'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { ThemeContext, useTheme } from '@/app/components/context/ThemeContext'
import ToggleSwitch from '@/app/components/ToggleSwitch'
import { getServerSession } from 'next-auth'

import { FC, useContext } from 'react'

interface pageProps {
}

const page: FC<pageProps> = ({}) => {
// console.log('sesion',getServerSession(authOptions))
  return (
    <div className='bg'>
      <ToggleSwitch/>
      
    </div>
  )
}

export default page