'use client';
import { useEffect, useState, useRef } from 'react';
import { chatbotAPI } from '../../../lib/api';
import { Send, Bot, User as UserIcon, Loader } from 'lucide-react';

interface Mensaje {
  id: number | string;
  tipo: 'usuario' | 'bot';
  texto: string;
  fecha: Date;
}

export default function ChatbotPage() {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [input, setInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [cargandoHistorial, setCargandoHistorial] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Cargar historial previo
  useEffect(() => {
    chatbotAPI.obtenerHistorial()
      .then((res) => {
        const historial: Mensaje[] = [];
        res.data.forEach((item: any, i: number) => {
          historial.push({
            id: `h-u-${i}`,
            tipo: 'usuario',
            texto: item.pregunta_usuario,
            fecha: new Date(item.fecha_consulta),
          });
          historial.push({
            id: `h-b-${i}`,
            tipo: 'bot',
            texto: item.respuesta_bot,
            fecha: new Date(item.fecha_consulta),
          });
        });
        if (historial.length === 0) {
          historial.push({
            id: 'bienvenida',
            tipo: 'bot',
            texto: '¡Hola! Soy el asistente virtual de NEXUS. Puedo ayudarte con información sobre programas, inscripciones y tu perfil. ¿En qué te puedo ayudar?',
            fecha: new Date(),
          });
        }
        setMensajes(historial);
      })
      .catch(() => {
        setMensajes([{
          id: 'bienvenida',
          tipo: 'bot',
          texto: '¡Hola! Soy el asistente virtual de NEXUS. ¿En qué te puedo ayudar hoy?',
          fecha: new Date(),
        }]);
      })
      .finally(() => setCargandoHistorial(false));
  }, []);

  // Scroll al fondo cuando llegan mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const enviar = async () => {
    const texto = input.trim();
    if (!texto || enviando) return;

    const msgUsuario: Mensaje = {
      id: Date.now(),
      tipo: 'usuario',
      texto,
      fecha: new Date(),
    };

    setMensajes((prev) => [...prev, msgUsuario]);
    setInput('');
    setEnviando(true);

    try {
      const res = await chatbotAPI.enviarMensaje(texto);
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          tipo: 'bot',
          texto: res.data.respuesta,
          fecha: new Date(),
        },
      ]);
    } catch {
      setMensajes((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          tipo: 'bot',
          texto: 'Lo siento, ocurrió un error al procesar tu consulta. Por favor intenta de nuevo.',
          fecha: new Date(),
        },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const sugerencias = [
    '¿Qué programas están disponibles?',
    '¿Cuáles son mis inscripciones?',
    '¿Cómo me inscribo a un programa?',
    '¿Cómo actualizo mi perfil?',
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary-600 p-2 rounded-xl">
            <Bot className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">NEXUS ChatBot</h1>
            <p className="text-xs text-green-500 font-medium">● En línea · Powered by Gemini AI</p>
          </div>
        </div>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4 bg-gray-50">
        {cargandoHistorial ? (
          <div className="flex justify-center py-8">
            <Loader className="animate-spin text-primary-500" size={24} />
          </div>
        ) : (
          <>
            {mensajes.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-3 ${msg.tipo === 'usuario' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${msg.tipo === 'bot' ? 'bg-primary-600' : 'bg-gray-400'}`}>
                  {msg.tipo === 'bot'
                    ? <Bot size={16} className="text-white" />
                    : <UserIcon size={16} className="text-white" />
                  }
                </div>

                {/* Burbuja */}
                <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.tipo === 'usuario'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-sm'
                  }`}
                >
                  {msg.texto}
                </div>
              </div>
            ))}

            {enviando && (
              <div className="flex items-end gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Sugerencias */}
      {mensajes.length <= 1 && !cargandoHistorial && (
        <div className="px-8 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Preguntas frecuentes:</p>
          <div className="flex flex-wrap gap-2">
            {sugerencias.map((s) => (
              <button
                key={s}
                onClick={() => setInput(s)}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 hover:border-primary-400 hover:text-primary-600 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-8 py-4">
        <div className="flex items-end gap-3 bg-gray-50 rounded-2xl border border-gray-200 px-4 py-2">
          <textarea
            className="flex-1 bg-transparent resize-none text-sm focus:outline-none text-gray-800 placeholder-gray-400 max-h-32"
            placeholder="Escribe tu consulta..."
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={enviar}
            disabled={!input.trim() || enviando}
            className={`p-2 rounded-xl transition-colors ${
              input.trim() && !enviando
                ? 'bg-primary-600 text-white hover:bg-primary-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">
          Presiona Enter para enviar · Shift+Enter para nueva línea
        </p>
      </div>
    </div>
  );
}
