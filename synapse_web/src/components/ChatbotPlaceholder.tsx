"use client"

import { MessageCircle } from "lucide-react";
import React from "react";

export function ChatbotPlaceholder() {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button 
        className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg flex items-center gap-2 group transition-all"
        title="Chatbot (Próximamente)"
        type="button"
        onClick={() => alert("El Chatbot se integrará en la siguiente fase del proyecto.")}
      >
        <MessageCircle className="w-6 h-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap">
          Asistente Virtual
        </span>
      </button>
    </div>
  );
}
