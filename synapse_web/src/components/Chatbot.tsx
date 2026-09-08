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

          <section className="max-h-64 overflow-y-auto p-4">
            {messages.length === 0 && <p>Historial de conversación</p>}
            {messages.map((item, index) => (
              <p key={`${item.role}-${index}`} className={item.role === "user" ? "text-right" : "text-left"}>
                <strong>{item.role === "user" ? "Tú: " : "Synapse: "}</strong>
                {item.content || (isLoading && item.role === "assistant" ? "..." : "")}
              </p>
            ))}
            {error && <p className="text-red-600">{error}</p>}
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
