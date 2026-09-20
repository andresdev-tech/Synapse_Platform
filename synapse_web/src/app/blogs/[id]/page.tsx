'use client';

import { use, useEffect, useState } from 'react';
import { fetchApi } from '@/lib/fetchApi';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { ArrowLeft, User, Calendar, Download, AlertCircle, Heart, ThumbsUp, ThumbsDown, Lightbulb, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CommentsSection } from '@/components/CommentsSection';

interface Note {
  id: string
  title: string
  content: string
  seoImage?: string
  body?: string,
  attachments?: { type: string, url: string }[]
  isGlobal: boolean
  authorId: string
  author?: { name: string; role: string }
  category?: { name: string; id: string }
  categoryId?: string | null
  createdAt: string
  deletedAt?: string | null
  reactions?: { userId: string, type: string }[]
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BlogDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Reacciones state
  const [reactionsCounts, setReactionsCounts] = useState<Record<string, number>>({
    LIKE: 0, LOVE: 0, USEFUL: 0, IMPORTANT: 0, DISLIKE: 0
  });
  const [userReaction, setUserReaction] = useState<string | null>(null);
  const [isReacting, setIsReacting] = useState(false);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const res = await fetchApi("/api/notes");
        if (!res.ok) throw new Error('Error cargando la noticia');

        const data = await res.json();
        if (Array.isArray(data)) {
          const found = data.find((n: Note) => n.id === id);
          if (found) {
            setNote(found);
            
            // Procesar reacciones
            if (found.reactions) {
              const counts = { LIKE: 0, LOVE: 0, USEFUL: 0, IMPORTANT: 0, DISLIKE: 0 } as Record<string, number>;
              found.reactions.forEach((r: any) => {
                if (counts[r.type] !== undefined) counts[r.type]++;
              });
              setReactionsCounts(counts);
              
              if (session?.user?.id) {
                const userReact = found.reactions.find((r: any) => r.userId === session.user.id);
                if (userReact) setUserReaction(userReact.type);
              }
            }
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
  }, [id, session?.user?.id]);

  const handleToggleReaction = async (type: string) => {
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      setIsReacting(true);
      
      const res = await fetchApi(`/api/notes/${id}/reaction`, {
        method: "POST",
        body: JSON.stringify({ type })
      });
      
      if (!res.ok) throw new Error("Error toggling reaction");
      
      const data = await res.json();
      
      // Update local state smoothly based on backend response
      setReactionsCounts(prev => {
        const newCounts = { ...prev };
        if (userReaction) newCounts[userReaction] = Math.max(0, newCounts[userReaction] - 1);
        if (data.action !== "removed" && data.type) {
          newCounts[data.type] = (newCounts[data.type] || 0) + 1;
        }
        return newCounts;
      });
      
      setUserReaction(data.action === "removed" ? null : data.type);
      
    } catch (err) {
      console.error(err);
    } finally {
      setIsReacting(false);
    }
  };

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
      <nav className="bg-sena-500 text-white shadow-md sticky top-0 z-30">
        <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24 h-16 flex items-center justify-between">
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

      <main className="w-full px-4 sm:px-8 md:px-16 lg:px-24 py-8 md:py-12">
        <article className="w-full bg-white dark:bg-zinc-900 rounded-3xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden">
          
          <div className="p-6 md:p-8 lg:p-10">
            <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-slate-100 leading-tight mb-6">
              {note.title}
            </h1>

            {/* Fecha y Autor */}
            <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 mb-6">
              <User className="w-4 h-4 mr-2" />
              <span className="mr-4 text-zinc-700 dark:text-slate-300 font-bold">
                {note.author?.name || "Administración"}
              </span>
              <span className="capitalize mr-4">
                • {new Date(note.createdAt).toLocaleDateString('es-CO', { 
                  day: 'numeric', 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </span>
              {note.category && (
                <span className="px-3 py-1 bg-sena-50 dark:bg-sena-900/30 text-sena-600 dark:text-sena-400 font-bold rounded-full text-[10px] uppercase ml-auto">
                  {note.category.name}
                </span>
              )}
            </div>
          </div>

          {/* Imagen Principal */}
          {note.seoImage && (
            <div className="w-full flex justify-start bg-white dark:bg-zinc-900 px-6 md:px-10 py-6">
              <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm">
                <Image 
                  src={note.seoImage} 
                  alt={note.title} 
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            </div>
          )}

          <div className="p-6 md:p-8 lg:p-10">
            {/* Contenido */}
            <div className="text-lg text-slate-700 dark:text-slate-300 leading-normal">
              {(() => {
                const bodyStr = note.body || note.content || '';
                
                try {
                  if (bodyStr.trim().startsWith('[') && bodyStr.trim().endsWith(']')) {
                    const blocks = JSON.parse(bodyStr);
                    if (Array.isArray(blocks)) {
                      return (
                        <div className="space-y-6">
                          {blocks.map((block: any, idx: number) => {
                            if (block.type === 'text') {
                              return <div key={idx} className="whitespace-pre-wrap leading-relaxed">{block.content}</div>;
                            }
                            if (block.type === 'image' && block.url) {
                              return (
                                <div key={idx} className="rounded-2xl overflow-hidden shadow-sm my-4 border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800 max-w-2xl">
                                  <img src={block.url} alt="Imagen del anuncio" loading="lazy" className="w-full h-auto object-cover" />
                                </div>
                              );
                            }
                            if (block.type === 'pdf' && block.url) {
                              return (
                                <a key={idx} href={block.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 my-4 bg-slate-50 dark:bg-zinc-800/50 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors border border-slate-200 dark:border-zinc-700 font-bold group">
                                  <div className="w-12 h-12 shrink-0 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 group-hover:scale-110 transition-transform">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                  </div>
                                  <div className="flex flex-col">
                                    <span>Descargar Documento Adjunto</span>
                                    {block.name && <span className="text-xs font-normal text-slate-500">{block.name}</span>}
                                  </div>
                                </a>
                              );
                            }
                            if (block.type === 'video' && block.url) {
                              const ytMatch = block.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?"']+)/);
                              const videoId = ytMatch ? ytMatch[1] : "";
                              
                              if (videoId) {
                                return (
                                  <div key={idx} className="rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm aspect-video relative bg-black my-4 max-w-2xl">
                                    <iframe 
                                      src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                                      className="absolute inset-0 w-full h-full"
                                      title="YouTube video player"
                                      loading="lazy"
                                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                      allowFullScreen
                                    ></iframe>
                                  </div>
                                );
                              }
                              return (
                                <a key={idx} href={block.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm border border-blue-100 hover:bg-blue-100 transition-colors my-4">
                                  Ver Video Externo
                                </a>
                              );
                            }
                            return null;
                          })}
                        </div>
                      );
                    }
                  }
                } catch (e) {}

                if (bodyStr.includes('<') && bodyStr.includes('>')) {
                  let optimizedBody = bodyStr;
                  if (!optimizedBody.includes('loading="lazy"')) {
                    optimizedBody = optimizedBody.replace(/<iframe /g, '<iframe loading="lazy" ');
                    optimizedBody = optimizedBody.replace(/<img /g, '<img loading="lazy" ');
                  }
                  return <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: optimizedBody }} />;
                }

                return (
                  <div className="space-y-4">
                    {bodyStr.split('\n').map((line: string, i: number) => (
                      line.trim() ? <p key={i}>{line}</p> : null
                    ))}
                  </div>
                );
              })()}
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
                      <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm relative aspect-video sm:col-span-2 max-w-2xl mx-auto w-full">
                        <Image src={att.url} alt="Adjunto" fill sizes="(max-width: 768px) 100vw, 768px" className="object-cover" />
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
                        <div key={idx} className="rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 shadow-sm aspect-video relative bg-black sm:col-span-2 max-w-2xl mx-auto w-full">
                          <iframe 
                            src={`https://www.youtube-nocookie.com/embed/${videoId}`}
                            className="absolute inset-0 w-full h-full"
                            title="YouTube video player"
                            loading="lazy"
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
          
          {/* ACCIONES DEL POST (Reacciones) */}
          <div className="flex flex-wrap items-center gap-2 md:gap-4 py-4 px-6 md:px-10 border-y border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
            <button 
              onClick={() => handleToggleReaction("LIKE")}
              disabled={isReacting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                userReaction === "LIKE" 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
              }`}
            >
              <ThumbsUp className={`w-5 h-5 ${userReaction === "LIKE" ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Me gusta</span> {reactionsCounts.LIKE > 0 && `(${reactionsCounts.LIKE})`}
            </button>
            <button 
              onClick={() => handleToggleReaction("LOVE")}
              disabled={isReacting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                userReaction === "LOVE" 
                  ? 'bg-red-50 text-red-500 border border-red-200 dark:bg-red-900/20 dark:border-red-800' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
              }`}
            >
              <Heart className={`w-5 h-5 ${userReaction === "LOVE" ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Me encanta</span> {reactionsCounts.LOVE > 0 && `(${reactionsCounts.LOVE})`}
            </button>
            <button 
              onClick={() => handleToggleReaction("USEFUL")}
              disabled={isReacting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                userReaction === "USEFUL" 
                  ? 'bg-green-50 text-green-600 border border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
              }`}
            >
              <Lightbulb className={`w-5 h-5 ${userReaction === "USEFUL" ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Útil</span> {reactionsCounts.USEFUL > 0 && `(${reactionsCounts.USEFUL})`}
            </button>
            <button 
              onClick={() => handleToggleReaction("IMPORTANT")}
              disabled={isReacting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                userReaction === "IMPORTANT" 
                  ? 'bg-amber-50 text-amber-500 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
              }`}
            >
              <Star className={`w-5 h-5 ${userReaction === "IMPORTANT" ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Importante</span> {reactionsCounts.IMPORTANT > 0 && `(${reactionsCounts.IMPORTANT})`}
            </button>
            <button 
              onClick={() => handleToggleReaction("DISLIKE")}
              disabled={isReacting}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-all ${
                userReaction === "DISLIKE" 
                  ? 'bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-900/20 dark:border-rose-800' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 dark:bg-zinc-800 dark:text-slate-400 dark:border-zinc-700 dark:hover:bg-zinc-700'
              }`}
              title="No me gusta / Spam"
            >
              <ThumbsDown className={`w-5 h-5 ${userReaction === "DISLIKE" ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">No me gusta</span> {reactionsCounts.DISLIKE > 0 && `(${reactionsCounts.DISLIKE})`}
            </button>
          </div>

          {/* SECCIÓN DE COMENTARIOS */}
          <CommentsSection contentId={note.id} />
          </div>
        </article>
      </main>
    </div>
  );
}
