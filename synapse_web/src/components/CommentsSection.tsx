"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { fetchApi } from "@/lib/fetchApi"
import { MessageSquare, Send, User } from "lucide-react"

interface CommentType {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    email: string
    image: string | null
  }
}

export function CommentsSection({ contentId }: { contentId: string }) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<CommentType[]>([])
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [contentId])

  const fetchComments = async () => {
    try {
      const res = await fetchApi(`/api/comments/${contentId}`)
      if (res.ok) {
        const data = await res.json()
        setComments(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error("Error fetching comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetchApi("/api/comments", {
        method: "POST",
        body: JSON.stringify({
          content: newComment,
          contentId: contentId
        })
      })

      if (res.ok) {
        const created = await res.json()
        setComments(prev => [...prev, created])
        setNewComment("")
      }
    } catch (error) {
      console.error("Error posting comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (seconds < 60) return 'Hace un momento'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `Hace ${minutes} min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Hace ${hours} h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Hace ${days} d`
    return date.toLocaleDateString()
  }

  return (
    <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-zinc-800">
      <div className="flex items-center mb-6">
        <MessageSquare className="w-6 h-6 text-sena-500 mr-3" />
        <h3 className="text-2xl font-black text-zinc-800 dark:text-slate-100">
          Comentarios <span className="text-slate-400 text-lg">({comments.length})</span>
        </h3>
      </div>

      <div className="space-y-6">
        {/* Comments List */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sena-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 dark:bg-zinc-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-700">
            <p className="text-slate-500 dark:text-slate-400 font-medium">Sé el primero en comentar este anuncio.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {comments.map((comment) => (
              <div key={comment.id} className="flex gap-4 group">
                <div className="shrink-0">
                  {comment.author.image ? (
                    <img src={comment.author.image} alt={comment.author.name || "User"} className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-zinc-700" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-sena-100 dark:bg-sena-900/40 flex items-center justify-center text-sena-600 dark:text-sena-400 border border-sena-200 dark:border-sena-800">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="bg-slate-50 dark:bg-zinc-800/80 p-4 rounded-2xl rounded-tl-none border border-slate-100 dark:border-zinc-700/50">
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="font-bold text-zinc-900 dark:text-slate-200 text-sm">
                        {comment.author.name || comment.author.email.split('@')[0]}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

          {/* Comment Input */}
        {status === "loading" ? (
          <div className="mt-6 p-5 rounded-2xl flex justify-center items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sena-500"></div>
          </div>
        ) : session ? (
          <form onSubmit={handleSubmit} className="flex gap-4 mt-6 items-start">
            <div className="shrink-0 hidden sm:block">
              {session.user?.image ? (
                <img src={session.user.image} alt="Tú" className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-zinc-700" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                  <User className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="flex-1 relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escribe un comentario..."
                disabled={isSubmitting}
                className="w-full bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 text-zinc-800 dark:text-slate-200 text-sm rounded-2xl p-4 pr-14 min-h-[50px] max-h-[150px] resize-y focus:ring-2 focus:ring-sena-500 focus:border-sena-500 outline-none transition-all placeholder:text-slate-400"
                rows={newComment.split('\n').length > 1 ? 3 : 1}
              />
              <button
                type="submit"
                disabled={!newComment || isSubmitting}
                className="absolute right-2 top-2 p-2 bg-sena-500 hover:bg-sena-600 disabled:bg-slate-300 disabled:dark:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
                title="Publicar comentario"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6 p-5 bg-sena-50 dark:bg-sena-900/10 rounded-2xl border border-sena-100 dark:border-sena-900/30 text-center flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sena-800 dark:text-sena-200 text-sm font-medium">Inicia sesión para participar en la conversación.</p>
            <a href="/login" className="px-6 py-2 bg-sena-500 hover:bg-sena-600 text-white font-bold rounded-xl transition-colors text-sm shrink-0 shadow-sm">
              Iniciar Sesión
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
