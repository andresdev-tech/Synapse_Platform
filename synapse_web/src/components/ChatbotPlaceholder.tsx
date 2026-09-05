"use client"

import { usePathname, useRouter } from "next/navigation"
import { MessageCircle } from "lucide-react";

export function ChatbotPlaceholder() {
  const pathname = usePathname()
  const router = useRouter()
  
  // Don't show on chatbot page
  if (pathname === '/chatbot') {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        className="bg-sena-500 hover:bg-sena-600 text-white p-4 rounded-full shadow-lg flex items-center gap-2 group transition-all"
        title="Abrir Chatbot"
        type="button"
        onClick={() => router.push('/chatbot')}
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}
