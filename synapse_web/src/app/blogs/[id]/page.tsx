'use client';

import { use, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/fetchApi';
import { ArrowLeft, User, Calendar, Download, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Note {
  id: string
  title: string
  content: string
  seoImage?: string
  attachments?: { type: string, url: string }[]
  isGlobal: boolean
  authorId: string
  author?: { name: string; role: string }
  category?: { name: string; id: string }
  categoryId?: string | null
  createdAt: string
  deletedAt?: string | null
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        // Intentamos obtener todas las notas para filtrar la seleccionada
        const res = await fetchApi("/api/notes");
        if (!res.ok) throw new Error('Error cargando la noticia');

        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((n: Note) => n.id === id);
          if (found) {
            setNote(found);
          } else {
            setError('Noticia no encontrada');
          }
        }
      } catch (err) {
        console.error(err);
        setError('Ocurrió un error al cargar la noticia');
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sena-500"></div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-900 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-slate-100 mb-2">{error || 'No encontrado'}</h1>
        <button
          onClick={() => router.back()}
          className="mt-4 px-6 py-2 bg-sena-500 text-white rounded-lg hover:bg-sena-600 transition-colors"
        >
          Volver atrás
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-900 text-zinc-900 dark:text-slate-100 transition-colors duration-300">
      {/* Navbar Minimalista (Estilo SENA) */}
      <nav className="bg-sena-500 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center text-white/90 hover:text-white transition-colors group font-bold"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Volver</span>
          </button>
          <span className="font-bold text-sm tracking-widest uppercase opacity-90">Noticias CTMA</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <article className="bg-white dark:bg-zinc-900">
          
          <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-slate-100 leading-tight mb-8">
            {note.title}
          </h1>

          {/* Imagen Principal enmarcada */}
          {note.seoImage && (
            <div className="w-full mb-6 rounded-sm border-4 border-slate-100 dark:border-zinc-800 p-1">
              <img 
                src={note.seoImage} 
                alt={note.title} 
                className="w-full h-auto object-cover max-h-[500px]"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
            </div>
          )}

          {/* Fecha y Autor */}
          <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 border-b border-slate-100 dark:border-zinc-800 pb-4">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="capitalize mr-4">
              {new Date(note.createdAt).toLocaleDateString('es-CO', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </span>
            {note.category && (
              <span className="px-2 py-0.5 bg-sena-50 dark:bg-sena-900/30 text-sena-600 dark:text-sena-400 font-bold rounded text-xs uppercase ml-auto">
                {note.category.name}
              </span>
            )}
          </div>

          {/* Contenido */}
          <div className="prose prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed">
            {/* Si el backend envía HTML (listas, negritas), usamos dangerouslySetInnerHTML,
                de lo contrario (texto con guiones/puntos), respetamos los saltos de línea con whitespace-pre-wrap */}
            {(note.content || '').includes('<') && (note.content || '').includes('>') ? (
              <div dangerouslySetInnerHTML={{ __html: note.content || '' }} />
            ) : (
              <div className="whitespace-pre-wrap">{note.content || ''}</div>
            )}
          </div>

          {/* Adjuntos y Multimedia */}
          {note.attachments && note.attachments.length > 0 && (
            <div className="mt-16 pt-8 border-t border-slate-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-800 dark:text-slate-100 mb-6 flex items-center">
                Recursos Adjuntos
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {note.attachments.map((att, idx) => {
                  if (att.type === 'image') {
                    return (
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
                        <img src={att.url} alt="Adjunto" className="w-full h-auto object-cover" />
                      </div>
                    );
                  } else if (att.type === 'video') {
                    let videoUrl = att.url;
                    const ytMatch = att.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?"']+)/);
                    let videoId = ytMatch ? ytMatch[1] : "";
                    
                    if (!videoId) {
                      const iframeMatch = att.url.match(/src=["'](.*?)["']/);
                      if (iframeMatch) {
                        videoUrl = iframeMatch[1];
                        const backupMatch = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?"']+)/);
                        if (backupMatch) videoId = backupMatch[1];
                      }
                    }

                    if (videoId) {
                      return (
                        <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm aspect-video relative bg-black sm:col-span-2">
                          <iframe 
                            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                            className="absolute inset-0 w-full h-full"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    }
                    
                    return (
                      <a key={idx} href={videoUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-4 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-100 hover:bg-red-100 transition-colors">
                        Ver Video Externo
                      </a>
                    );
                  } else {
                    return (
                      <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-700 transition-colors font-bold text-sm border border-slate-200 dark:border-zinc-700 sm:col-span-2">
                        <div className="w-10 h-10 shrink-0 rounded-full bg-sena-100 dark:bg-sena-900/30 flex items-center justify-center text-sena-600 dark:text-sena-400">
                          <Download className="w-5 h-5" />
                        </div>
                        Descargar Documento / PDF Adjunto
                      </a>
                    );
                  }
                })}
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  );
}
