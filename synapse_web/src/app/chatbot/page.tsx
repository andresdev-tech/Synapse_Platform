"use client"

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, X } from 'lucide-react'
import { fetchApi } from '@/lib/fetchApi'

interface Message {
  id: string
  content: string
  sender: 'user' | 'bot'
  timestamp: Date
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
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
    scrollToBottom()
  }, [messages])

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

          const event = JSON.parse(dataLine.slice(5).trim()) as {
            type?: string
            content?: string
            error?: string
          }

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

  return (
    <div className="flex flex-col h-screen bg-sena-50">
      {/* Header */}
      <header className="bg-sena-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold">SYNAPSE Chat</h1>
              <p className="text-sm text-sena-100">Asistente virtual</p>
            </div>
          </div>
          <button className="p-2 hover:bg-sena-700 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.sender === 'bot' && (
                <div className="shrink-0 bg-sena-500 text-white p-3 rounded-full">
                  <Bot className="w-6 h-6" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                  message.sender === 'user'
                    ? 'bg-sena-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 rounded-bl-sm border border-sena-200'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-sena-200' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              {message.sender === 'user' && (
                <div className="shrink-0 bg-sena-600 text-white p-3 rounded-full">
                  <User className="w-6 h-6" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-3 justify-start">
              <div className="shrink-0 bg-sena-500 text-white p-3 rounded-full">
                <Bot className="w-6 h-6" />
              </div>
              <div className="bg-white rounded-2xl rounded-bl-sm px-4 py-3 border border-sena-200">
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
      <footer className="bg-white border-t border-sena-200 p-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-3 bg-sena-50 border border-sena-300 rounded-full focus:outline-none focus:ring-2 focus:ring-sena-500 focus:border-transparent transition-all text-gray-800 placeholder-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="bg-sena-600 hover:bg-sena-700 disabled:bg-sena-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-full font-medium transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-2">
            SYNAPSE - Asistente virtual inteligente
          </p>
        </div>
      </footer>
    </div>
  )
}
