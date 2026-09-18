"use client"

import { useState, useRef, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Send, Bot, User, X, MessageCircle } from 'lucide-react'
import { fetchApi } from '@/lib/fetchApi'

type Message = {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export function ChatbotPlaceholder() {
  const pathname = usePathname()
  const router = useRouter()
  
  const [isOpen, setIsOpen] = useState(false)

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      content: '¡Hola! Soy el asistente virtual de SYNAPSE. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    const content = inputValue.trim()
    if (!content || isTyping) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date()
    }

    const botMessageId = (Date.now() + 1).toString()
    setMessages(prev => [...prev, userMessage, {
      id: botMessageId,
      content: '',
      sender: 'bot',
      timestamp: new Date()
    }])
    setInputValue('')
    setIsTyping(true)

    try {
      const response = await fetchApi('/api/chatbot', {
        method: 'POST',
        body: JSON.stringify({ message: content })
      })

      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => null)
        throw new Error(result?.error || 'No se pudo obtener una respuesta')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { value, done } = await reader.read()
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done })
        const events = buffer.split('\n\n')
        buffer = events.pop() || ''

        for (const eventText of events) {
          const dataLine = eventText.split('\n').find(line => line.startsWith('data:'))
          if (!dataLine) continue

          const event = JSON.parse(dataLine.slice(5).trim())

          if (event.type === 'error') {
            throw new Error(event.error || 'Error del chatbot')
          }

          if (event.type === 'chunk' && event.content) {
            setMessages(prev => prev.map(message =>
              message.id === botMessageId
                ? { ...message, content: message.content + event.content }
                : message
            ))
          }
        }

        if (done) break
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión'
      setMessages(prev => prev.map(message =>
        message.id === botMessageId
          ? { ...message, content: errorMessage }
          : message
      ))
    } finally {
      setIsTyping(false)
    }
  }

  if (pathname === '/chatbot') {
    return null
  }

  return (
    <>
      {/* Botón flotante */}
      {!isOpen && (
        <div className="fixed bottom-4 right-4 z-[9999] sm:bottom-6 sm:right-6">
          <button 
            className="bg-sena-500 hover:bg-sena-600 text-white p-4 rounded-full shadow-2xl flex items-center gap-2 group transition-all hover:scale-110"
            title="Abrir Chatbot"
            type="button"
            onClick={() => setIsOpen(true)}
          >
            <MessageCircle className="w-7 h-7" />
          </button>
        </div>
      )}

      {/* Interfaz del Chatbot modal */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-[2px] transition-all">
          <div className="w-full h-full sm:w-[420px] sm:h-[650px] sm:max-h-[85vh] flex flex-col bg-sena-50 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <header className="bg-sena-600 text-white shadow-md shrink-0">
              <div className="flex w-full items-center justify-between gap-3 px-4 py-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-white/20 p-2">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold">SYNAPSE Chat</h1>
                    <p className="text-xs text-sena-100">Asistente virtual</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-sena-700 rounded-lg transition-colors"
                  title="Cerrar chat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </header>

            {/* Messages Area */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-5">
              <div className="w-full space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex w-full gap-3 items-start ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.sender === 'bot' && (
                      <div className="shrink-0 bg-sena-500 text-white p-2 sm:p-3 rounded-full">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] md:max-w-[75%] w-fit rounded-2xl px-4 py-3 shadow-sm ${message.sender === 'user' ? 'bg-sena-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-sena-200'}`}
                    >
                      <div 
                        className="text-sm leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ 
                          __html: message.content
                            .replace(/\n/g, '<br/>')
                            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline">$1</a>')
                            .replace(/### (.*?)(\n|$)/g, '<strong class="block text-lg mt-2">$1</strong>$2')
                        }}
                      />
                      <p suppressHydrationWarning className={`text-[10px] mt-1 text-right ${message.sender === 'user' ? 'text-sena-200' : 'text-gray-400'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <div className="shrink-0 bg-sena-600 text-white p-2 sm:p-3 rounded-full">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                ))}
                {isTyping && (
                  <div className="flex w-full gap-3 items-start justify-start">
                    <div className="shrink-0 bg-sena-500 text-white p-2 sm:p-3 rounded-full">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 border border-sena-200 shadow-sm w-fit">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-sena-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-sena-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-sena-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </main>

            {/* Input Area */}
            <footer className="border-t border-sena-200 bg-white p-3 shrink-0">
              <div className="w-full">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Escribe tu mensaje..."
                    className="flex-1 px-4 py-2 bg-sena-50 border border-sena-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent transition-all text-sm text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isTyping}
                    className="bg-sena-600 hover:bg-sena-700 disabled:bg-sena-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-full font-medium transition-all flex items-center justify-center shadow-md hover:shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <p className="text-[10px] text-gray-400 text-center mt-2">
                  SYNAPSE - Asistente virtual inteligente
                </p>
              </div>
            </footer>
          </div>
        </div>
      )}
    </>
  )
}
