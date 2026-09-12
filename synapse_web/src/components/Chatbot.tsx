"use client"

import { FormEvent, useState } from "react";
import { fetchApi } from "../lib/fetchApi";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const parseSseEvent = (line: string): { type?: string; content?: string; error?: string } | null => {
  if (!line.startsWith("data:")) return null;

  try {
    return JSON.parse(line.slice(5).trim());
  } catch {
    return null;
  }
};

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = message.trim();
    if (!content || isLoading) return;

    setMessage("");
    setError(null);
    setMessages((current) => [
      ...current,
      { role: "user", content },
      { role: "assistant", content: "" },
    ]);
    setIsLoading(true);

    try {
      const response = await fetchApi("/api/chatbot", {
        method: "POST",
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok || !response.body) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "No se pudo obtener una respuesta");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      const appendAssistantContent = (chunk: string) => {
        setMessages((current) => {
          const next = [...current];
          const last = next.length - 1;
          next[last] = { ...next[last], content: next[last].content + chunk };
          return next;
        });
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventText of events) {
          const event = parseSseEvent(eventText.trim());
          if (event?.type === "chunk" && event.content) appendAssistantContent(event.content);
          if (event?.type === "error") throw new Error(event.error || "Error del chatbot");
        }

        if (done) break;
      }
    } catch (requestError) {
      const errorMessage = requestError instanceof Error ? requestError.message : "Error de conexión";
      setError(errorMessage);
      setMessages((current) => current.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex bg-white">
      <main className="bg-gray-100 h-screen w-screen">
          <p className="text-2xl font-bold text-white mb-4 text-center bg-green-800 rounded-r-full py-2">SYNAPSE</p>

          <section className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            {messages.length === 0 && <p className="text-center text-gray-500 mt-4">Historial de conversación</p>}
            {messages.map((item, index) => {
              // Formateador básico de Markdown
              let formattedContent = item.content
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negritas
                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>') // Enlaces
                .replace(/### (.*?)(\n|$)/g, '<strong class="block text-lg mt-2">$1</strong>$2'); // Subtítulos
              
              return (
                <div key={`${item.role}-${index}`} className={`flex flex-col ${item.role === "user" ? "items-end" : "items-start"}`}>
                  <span className="text-xs text-gray-500 mb-1 ml-1">{item.role === "user" ? "Tú" : "Synapse"}</span>
                  <div 
                    className={`inline-block p-3 rounded-2xl max-w-[85%] whitespace-pre-wrap text-sm shadow-sm ${
                      item.role === "user" 
                        ? "bg-green-500 text-white rounded-tr-none" 
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none"
                    }`}
                    dangerouslySetInnerHTML={{ __html: formattedContent || (isLoading && item.role === "assistant" ? "..." : "") }}
                  />
                </div>
              );
            })}
            {error && <p className="text-red-600 text-center text-sm">{error}</p>}
          </section>

          <form className="flex flex-row gap-2 p-4" onSubmit={handleSubmit}>
            <input
              className="rounded-full h-8 bg-white px-3"
              placeholder="Tienes alguna duda"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="max-h-8 min-w-20 rounded-4xl bg-green-500" disabled={isLoading || !message.trim()}>
              {isLoading ? "..." : "Enviar"}
            </button>
          </form>
      </main>
    </div>
  )
}
