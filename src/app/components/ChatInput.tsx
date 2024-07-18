'use client'
import { Loader2 } from 'lucide-react'
import { FC, useRef, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'
import Button from './ui/Button'
import axios from 'axios'
import toast from 'react-hot-toast'

interface ChatInputProps {
    chatId:string
    chatPartner:User
}

const ChatInput: FC<ChatInputProps> = ({chatId,chatPartner}) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [input, setInput] = useState<string>('')
    const [isLoading, setloading] = useState<boolean>(false)
    
    const sendMessage =  async()=>{
      setloading(true)

      try {
        if(!input){
          textareaRef.current?.focus()
          toast.error("Provide proper input")
        }else{
          const res = await axios.post('/api/message/send',{
            chatId:chatId,
            text:input
          })
          textareaRef.current?.focus()
          setInput('')
        }
        
      } catch (error) {
        console.log('error',error)
      }finally{
        setloading(false)
      }
    }
  return (
    <div className='border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0'>
      <div className='relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600'>
        <ReactTextareaAutosize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          rows={5}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className='block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6'
        />
        <div
          onClick={() => textareaRef.current?.focus()}
          className='py-2'
          aria-hidden='true'
        >
          <div className='py-px'>
            <div className='h-9' />
          </div>
        </div>

        <div className='absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2'>
          <div className='flex-shrink-0'>
            <Button isLoading={isLoading}  onClick={sendMessage} type='submit'>
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChatInput