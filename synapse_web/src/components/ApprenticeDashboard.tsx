"use client"
import { fetchApi } from "@/lib/fetchApi";

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { Megaphone, Link as LinkIcon, Send, User, MessageSquarePlus, X, GripHorizontal, Search, BookOpen, Calendar, Moon, Sun, Download, FileText, ArrowLeft } from "lucide-react"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface Note {
  id: string
  title: string
  content: string
  imageUrl?: string
  isGlobal: boolean
  authorId: string
  author?: { name: string; role: string }
  category?: { name: string; id: string }
  categoryId?: string | null
  createdAt: string
  deletedAt?: string | null
}

interface Category {
  id: string
  name: string
}

const officialResources = [
  { title: "Guía de Acogida e Inducción", url: "/ctma/guia-acogida" },
  { title: "Reglamento del Aprendiz SENA", url: "/ctma/reglamento" },
  { title: "Guía de Etapa Productiva", url: "/ctma/etapa-productiva" },
  { title: "Directorio de Contactos", url: "/ctma/directorio" },
  { title: "Preguntas Frecuentes", url: "/ctma/preguntas-frecuentes" },
]

function SortableNoteItem({ note }: { note: Note }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: note.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <article 
      ref={setNodeRef} 
      style={style} 
      className={`group bg-white dark:bg-zinc-800 rounded-3xl shadow-sm hover:shadow-xl border border-slate-100 dark:border-zinc-700 hover:border-sena-100 dark:hover:border-sena-500/50 transition-all duration-300 flex flex-col overflow-hidden relative ${isDragging ? 'opacity-50 ring-2 ring-sena-500 scale-105' : ''}`}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/80 dark:bg-zinc-700/80 backdrop-blur text-slate-400 dark:text-slate-300 hover:text-sena-500 dark:hover:text-sena-400 rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        title="Arrastrar para reordenar"
      >
        <GripHorizontal className="w-5 h-5" />
      </div>

      {note.imageUrl && (
        <div className="h-56 bg-slate-100 dark:bg-zinc-900 overflow-hidden relative">
          <img loading="lazy" 
            src={note.imageUrl} 
            alt={note.title} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 dark:from-zinc-900/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          {note.category && (
            <div className="absolute top-4 left-4 z-10">
              <span className="px-3 py-1 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-sm text-sena-800 dark:text-sena-300 text-xs font-black rounded-lg uppercase tracking-wider shadow-sm">
                {note.category.name}
              </span>
            </div>
          )}
        </div>
      )}
      
      <div className="p-8 flex flex-col flex-grow">
        {!note.imageUrl && note.category && (
          <span className="inline-block px-3 py-1 mb-4 bg-sena-50 dark:bg-sena-900/30 text-sena-600 dark:text-sena-300 text-xs font-bold rounded-lg uppercase tracking-wider w-fit border border-sena-100 dark:border-sena-800/50">
            {note.category.name}
          </span>
        )}
        <h3 className="font-extrabold text-zinc-800 dark:text-slate-100 text-2xl leading-tight mb-4 group-hover:text-sena-500 dark:group-hover:text-sena-400 transition-colors line-clamp-2 pr-8">
          {note.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed flex-grow whitespace-pre-wrap line-clamp-4">
          {note.content}
        </p>
        
        <div className="mt-8 pt-5 border-t border-slate-100 dark:border-zinc-700 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-slate-300 dark:text-slate-500" />
            {note.author?.name || "Administración"}
          </div>
          <span>{new Date(note.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </article>
  )
}

export function ApprenticeDashboard() {
  const { data: session } = useSession()
  const [globalNotes, setGlobalNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Customization & Filters
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("ALL")

  // Modals State
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false)
  const [isResourcesOpen, setIsResourcesOpen] = useState(false)

  // Suggestion Form State
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newCategoryId, setNewCategoryId] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    const savedTheme = localStorage.getItem("synapse_theme")
    if (savedTheme === "dark") {
      setIsDarkMode(true)
      document.documentElement.classList.add("dark")
    } else if (savedTheme === "light") {
      setIsDarkMode(false)
      document.documentElement.classList.remove("dark")
    }

    fetchGlobalNotes()
    fetchCategories()
  }, [])

  const fetchGlobalNotes = async () => {
    try {
      const res = await fetchApi("/api/notes")
      let data = await res.json()
      if (Array.isArray(data)) {
        data = data.filter((n: any) => !n.deletedAt)
        
        if (session) {
          try {
            const prefRes = await fetchApi("/api/user/layout")
            if (prefRes.ok) {
              const { layoutPrefs } = await prefRes.json()
              if (layoutPrefs) {
                const prefs = JSON.parse(layoutPrefs)
                
                if (Array.isArray(prefs)) {
                  // Retrocompatibility (old array format)
                  data.sort((a: Note, b: Note) => {
                    const indexA = prefs.indexOf(a.id)
                    const indexB = prefs.indexOf(b.id)
                    if (indexA === -1 && indexB === -1) return 0
                    if (indexA === -1) return 1
                    if (indexB === -1) return -1
                    return indexA - indexB
                  })
                } else {
                  // New object format
                  if (prefs.order && Array.isArray(prefs.order)) {
                    data.sort((a: Note, b: Note) => {
                      const indexA = prefs.order.indexOf(a.id)
                      const indexB = prefs.order.indexOf(b.id)
                      if (indexA === -1 && indexB === -1) return 0
                      if (indexA === -1) return 1
                      if (indexB === -1) return -1
                      return indexA - indexB
                    })
                  }
                  if (prefs.isDarkMode !== undefined) {
                    setIsDarkMode(prefs.isDarkMode)
                    if (prefs.isDarkMode) {
                      document.documentElement.classList.add("dark")
                      localStorage.setItem("synapse_theme", "dark")
                    } else {
                      document.documentElement.classList.remove("dark")
                      localStorage.setItem("synapse_theme", "light")
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error("Error cargando prefs:", e)
          }
        }
        setGlobalNotes(data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await fetchApi("/api/categories")
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error(e)
    }
  }

  const saveLayoutPrefs = async (newOrder: string[], darkModeVal: boolean) => {
    if (!session) return;
    try {
      await fetchApi("/api/user/layout", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          layoutPrefs: {
            order: newOrder,
            isDarkMode: darkModeVal
          }
        })
      })
    } catch (e) {
      console.error("Error guardando layout", e)
    }
  }

  const toggleDarkMode = () => {
    const newVal = !isDarkMode
    setIsDarkMode(newVal)
    if (newVal) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("synapse_theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("synapse_theme", "light")
    }
    saveLayoutPrefs(globalNotes.map(n => n.id), newVal)
  }

  const handleSendSuggestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id || !newTitle.trim() || !newContent.trim()) return

    setIsSending(true)
    try {
      const res = await fetchApi("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
          isGlobal: false,
          authorId: session.user.id,
          categoryId: newCategoryId || null,
          published: true
        })
      })
      
      if (!res.ok) throw new Error("Error")
      
      setSuccessMessage("¡Sugerencia enviada con éxito!")
      setTimeout(() => {
        setNewTitle("")
        setNewContent("")
        setNewCategoryId("")
        setSuccessMessage("")
        setIsSuggestionOpen(false)
      }, 2000)
    } catch (e) {
      setSuccessMessage("Error al enviar. Intenta de nuevo.")
      setTimeout(() => setSuccessMessage(""), 3000)
    } finally {
      setIsSending(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = globalNotes.findIndex((n) => n.id === active.id)
      const newIndex = globalNotes.findIndex((n) => n.id === over.id)
      
      const newNotes = arrayMove(globalNotes, oldIndex, newIndex)
      setGlobalNotes(newNotes)
      saveLayoutPrefs(newNotes.map(n => n.id), isDarkMode)
    }
  }

  // Filtrado de Notas
  const filteredNotes = globalNotes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedFilter === "ALL" || n.categoryId === selectedFilter
    return matchesSearch && matchesCategory
  })

  // Eventos para el Widget Lateral
  const upcomingEvents = globalNotes.filter(n => 
    n.category?.name?.toLowerCase().includes("evento") || 
    n.category?.name?.toLowerCase().includes("acad") ||
    n.title.toLowerCase().includes("inscrip") ||
    n.title.toLowerCase().includes("fecha")
  ).slice(0, 3)

  return (
    <div className="bg-slate-50 dark:bg-zinc-900 text-zinc-900 dark:text-slate-100 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-8">
        
        {/* HEADER TIPO BLOG */}
        <div className="bg-gradient-to-br from-sena-500 via-sena-400 to-sena-600 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-900 dark:border-sena-500/50 dark:shadow-[0_0_30px_rgba(57,169,0,0.1)] rounded-[2rem] p-10 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between border border-transparent dark:border-sena-500/20">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>

          <div className="relative z-10 md:w-2/3 mb-6 md:mb-0 mt-4 md:mt-0">
            <span className="inline-block py-1 px-3 rounded-full bg-white/20 text-white text-xs font-bold tracking-widest uppercase mb-4 border border-white/30">
              PORTAL OFICIAL
            </span>
            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight tracking-tight">Novedades CTMA</h1>
            <p className="text-white/90 text-lg md:text-xl font-medium leading-relaxed max-w-xl">
              Entérate de las últimas convocatorias, noticias y eventos del Centro Tecnológico de la Manufactura Avanzada.
            </p>
          </div>
          <div className="relative z-10 w-full md:w-auto flex flex-col gap-3 mt-4 md:mt-0">
            <button 
              onClick={() => {
                if (!session) {
                  window.location.href = "/login";
                } else {
                  setIsSuggestionOpen(true);
                }
              }}
              className="w-full px-6 py-4 bg-white dark:bg-sena-500 text-sena-900 dark:text-white font-extrabold rounded-2xl hover:bg-sena-50 dark:hover:bg-sena-500 hover:scale-105 hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-3 group"
            >
              <MessageSquarePlus className="w-5 h-5 text-sena-500 dark:text-sena-200 group-hover:rotate-12 transition-transform" />
              <span>Enviar Sugerencia</span>
            </button>
            <button 
              onClick={() => setIsResourcesOpen(true)}
              className="w-full px-6 py-4 bg-sena-800/50 dark:bg-zinc-800 backdrop-blur-sm border border-sena-500/30 dark:border-zinc-700 text-sena-50 dark:text-slate-200 font-extrabold rounded-2xl hover:bg-sena-600/50 dark:hover:bg-zinc-700 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-3"
            >
              <BookOpen className="w-5 h-5 text-sena-300" />
              <span>Recursos y Trámites</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* MAIN FEED (IZQUIERDA) */}
          <div className="w-full lg:w-3/4">
            
            {/* BARRA DE BÚSQUEDA Y FILTROS */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 mb-8 shadow-sm border border-slate-100 dark:border-zinc-700">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-grow max-w-md">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Buscar anuncios..." 
                    aria-label="Buscar anuncios"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 dark:text-slate-200 font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  <button 
                    onClick={() => setSelectedFilter("ALL")}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === "ALL" ? "bg-sena-500 text-white shadow-md" : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
                  >
                    Todos
                  </button>
                  {categories.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedFilter(cat.id)}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm font-bold transition-all ${selectedFilter === cat.id ? "bg-sena-500 text-white shadow-md" : "bg-slate-100 dark:bg-zinc-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center">
                <Megaphone className="w-6 h-6 text-sena-500 dark:text-sena-400 mr-3" />
                <h2 className="text-2xl font-black text-zinc-800 dark:text-slate-100 tracking-tight">Últimos Anuncios</h2>
              </div>
              {filteredNotes.length > 0 && searchQuery === "" && selectedFilter === "ALL" && (
                <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-100 dark:bg-zinc-800 px-3 py-1 rounded-full">
                  Arrastra para ordenar
                </span>
              )}
            </div>

            {filteredNotes.length === 0 ? (
              <div className="text-center py-20 px-4 bg-white dark:bg-zinc-800 rounded-3xl border border-slate-100 dark:border-zinc-700 shadow-sm">
                <Megaphone className="w-16 h-16 text-slate-200 dark:text-slate-600 mx-auto mb-5" />
                <h3 className="text-xl font-bold text-zinc-700 dark:text-slate-300 mb-2">No hay anuncios</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm">No se encontraron anuncios con esos filtros.</p>
              </div>
            ) : (
              /* Solo permitimos Drag and Drop si NO hay filtros aplicados, para no dañar los índices del arreglo completo */
              searchQuery === "" && selectedFilter === "ALL" ? (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={filteredNotes.map(n => n.id)} strategy={rectSortingStrategy}>
                    <div className="grid gap-8 md:grid-cols-2">
                      {filteredNotes.map(n => (
                        <SortableNoteItem key={n.id} note={n} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
                  {filteredNotes.map(n => (
                    <SortableNoteItem key={n.id} note={n} />
                  ))}
                </div>
              )
            )}

            {/* SECCIÓN DIRECTO DEL BLOG CTMA: CANALES DE ATENCIÓN */}
            <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-sena-100 dark:bg-sena-900/50 flex items-center justify-center mr-4">
                  <User className="w-5 h-5 text-sena-500 dark:text-sena-400" />
                </div>
                <h2 className="text-2xl font-black text-zinc-800 dark:text-slate-100 tracking-tight">Atención al Aprendiz</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* WhatsApp */}
                <a href="https://wa.me/573052427400" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 hover:border-green-400 dark:hover:border-green-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-700 dark:text-slate-200 text-sm group-hover:text-green-600 dark:group-hover:text-green-400">WhatsApp CTMA</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">305 242 7400</span>
                  </div>
                </a>

                {/* Email */}
                <a href="mailto:dagarzonh@sena.edu.co" className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 hover:border-red-400 dark:hover:border-red-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-700 dark:text-slate-200 text-sm group-hover:text-red-600 dark:group-hover:text-red-400">Correo Electrónico</h4>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 block truncate max-w-[120px]">dagarzonh@sena.edu.co</span>
                  </div>
                </a>

                {/* Oficina Bienestar */}
                <a href="https://teams.microsoft.com/l/meetup-join/19%3ameeting_MWFmNDllYmQtMDY0OS00YmJlLWFjNTgtNjUxM2NlMzgwMzRm%40thread.v2/0?context=%7b%22Tid%22%3a%22cbc2c381-2f2e-4d93-91d1-506c9316ace7%22%2c%22Oid%22%3a%22fa1a60b6-f78d-4dd8-b766-fade5cf00b7e%22%7d" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 hover:border-sena-400 dark:hover:border-sena-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-sena-50 dark:bg-sena-900/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-sena-500" fill="currentColor" viewBox="0 0 24 24"><path d="M22.5 13.928v-3.856c0-.986-.799-1.785-1.785-1.785H17.5v-3.75c0-.986-.799-1.785-1.785-1.785H4.285C3.299 2.752 2.5 3.551 2.5 4.537v11.428c0 .986.799 1.785 1.785 1.785h11.43c.986 0 1.785-.799 1.785-1.785v-3.75h3.215c.986 0 1.785-.799 1.785-1.785zm-6.785 2.037H4.285V4.537h11.43v11.428zm5 1.821h-3.215v-7.5h3.215v7.5z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-700 dark:text-slate-200 text-sm group-hover:text-sena-500 dark:group-hover:text-sena-400">Oficina Digital Bienestar</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">Microsoft Teams</span>
                  </div>
                </a>

                {/* Radicaciones */}
                <a href="https://drive.google.com/file/d/1sahGQFNXAYv2MWWg1yzUBOGy1zZgbeMM/view" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all group">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-700 dark:text-slate-200 text-sm group-hover:text-amber-600 dark:group-hover:text-amber-400">Radicaciones PQRS</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">Ver Formato PDF</span>
                  </div>
                </a>

                {/* Ejecucion presupuestal */}
                <a href="https://app.powerbi.com/view?r=eyJrIjoiODQ2MGJjYzQtZTRhMC00YjM3LTljNWMtMjRmMDI5YzQzNTJmIiwidCI6ImNiYzJjMzgxLTJmMmUtNGQ5My05MWQxLTUwNmM5MzE2YWNlNyIsImMiOjR9" target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-white dark:bg-zinc-800 rounded-2xl border border-slate-100 dark:border-zinc-700 hover:border-sky-400 dark:hover:border-sky-500 hover:shadow-md transition-all group md:col-span-2 lg:col-span-2">
                  <div className="w-12 h-12 bg-sky-50 dark:bg-sky-900/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-700 dark:text-slate-200 text-sm group-hover:text-sky-600 dark:group-hover:text-sky-400">Portal de Indicadores y Presupuesto CTMA</h4>
                    <span className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 block">Tableros Interactivos PowerBI</span>
                  </div>
                </a>
              </div>
            </div>

            {/* SECCIÓN NUESTRA SEDE / UBICACIÓN */}
            <div className="mt-12 pt-8 border-t-2 border-slate-100 dark:border-zinc-800">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-sena-100 dark:bg-sena-900/50 flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-sena-500 dark:text-sena-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <h2 className="text-2xl font-black text-zinc-800 dark:text-slate-100 tracking-tight">Nuestra Sede CTMA</h2>
              </div>

              <div className="bg-white dark:bg-zinc-800 rounded-3xl border border-slate-100 dark:border-zinc-700 shadow-sm overflow-hidden flex flex-col md:flex-row">
                <div className="md:w-1/2 p-8 flex flex-col justify-center">
                  <span className="inline-block px-3 py-1 bg-sena-50 dark:bg-sena-900/30 text-sena-600 dark:text-sena-300 text-xs font-bold rounded-lg uppercase tracking-wider w-fit mb-4">SENA Regional Antioquia</span>
                  <h3 className="font-extrabold text-zinc-800 dark:text-slate-100 text-2xl mb-4">Centro de Tecnología de la Manufactura Avanzada</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">
                    Ubicado en el barrio Pedregal de Medellín, el CTMA es un referente regional en la formación de talento humano para la Cuarta Revolución Industrial, la mecánica, automotriz y las nuevas tecnologías.
                  </p>
                  <ul className="space-y-3 text-sm font-medium text-zinc-700 dark:text-slate-300">
                    <li className="flex items-start">
                      <svg className="w-5 h-5 text-sena-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"/></svg>
                      <span>Calle 104 #69-120, Pedregal<br/><span className="text-xs text-slate-500">Medellín, Antioquia</span></span>
                    </li>
                    <li className="flex items-center">
                      <svg className="w-5 h-5 text-sena-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                      <span>Lunes a Viernes: 6:00 AM - 10:00 PM</span>
                    </li>
                  </ul>
                  <a href="https://www.google.com/maps/search/?api=1&query=SENA+Centro+de+Tecnología+de+la+Manufactura+Avanzada+Pedregal+Medellin" target="_blank" rel="noopener noreferrer" className="mt-6 px-6 py-3 bg-sena-50 dark:bg-zinc-700 text-sena-600 dark:text-sena-300 font-bold rounded-xl text-center hover:bg-sena-100 dark:hover:bg-slate-600 transition-colors">
                    Cómo llegar (Google Maps)
                  </a>
                </div>
                <div className="md:w-1/2 h-64 md:h-auto relative bg-slate-200 dark:bg-zinc-900">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3965.748375640243!2d-75.57620308470559!3d6.296765795442539!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e442f2ed7f694ad%3A0x6e9f9076cf9e9e1c!2sSENA%20Centro%20de%20Tecnolog%C3%ADa%20de%20la%20Manufactura%20Avanzada!5e0!3m2!1ses!2sco!4v1699999999999!5m2!1ses!2sco" 
                    className="absolute inset-0 w-full h-full border-0 grayscale hover:grayscale-0 transition-all duration-500" 
                    allowFullScreen={false} 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade">
                  </iframe>
                </div>
              </div>
            </div>

          </div>

          {/* SIDEBAR (DERECHA) */}
          <div className="w-full lg:w-1/4 space-y-6">
            
            {/* WIDGET APARIENCIA */}
            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-700 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-700 flex items-center justify-center">
                  {isDarkMode ? <Moon className="w-5 h-5 text-sena-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                </div>
                <span className="font-bold text-zinc-700 dark:text-slate-200">Apariencia</span>
              </div>
              <button 
                onClick={toggleDarkMode} 
                className="w-14 h-8 bg-slate-200 dark:bg-sena-500 rounded-full relative transition-colors duration-300"
                title="Cambiar Modo"
                aria-label="Cambiar Modo Oscuro"
              >
                <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}>
                </div>
              </button>
            </div>

            {/* WIDGET AGENDA / EVENTOS */}
            {upcomingEvents.length > 0 && (
              <div className="bg-gradient-to-b from-sena-50 to-white dark:from-zinc-800 dark:to-zinc-800/50 rounded-3xl p-6 shadow-sm border border-sena-100 dark:border-zinc-700">
                <h3 className="font-black text-sena-900 dark:text-sena-400 mb-5 flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2 text-sena-500" />
                  Próximas Fechas
                </h3>
                <div className="space-y-4">
                  {upcomingEvents.map(event => (
                    <div key={event.id} className="flex gap-3 items-start p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-slate-100 dark:border-zinc-700">
                      <div className="flex flex-col items-center justify-center min-w-[3.5rem] bg-sena-50 dark:bg-zinc-700 rounded-lg py-2">
                        <span className="text-[10px] font-bold text-sena-400 dark:text-sena-300 uppercase">{new Date(event.createdAt).toLocaleString('es', { month: 'short' })}</span>
                        <span className="text-xl font-black text-sena-600 dark:text-white leading-none">{new Date(event.createdAt).getDate()}</span>
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-bold text-zinc-800 dark:text-slate-200 text-sm line-clamp-2">{event.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 block">{event.category?.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-zinc-800 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-zinc-700 sticky top-8">
              <h3 className="font-black text-zinc-800 dark:text-slate-200 mb-5 flex items-center text-lg">
                <LinkIcon className="w-5 h-5 mr-2 text-sena-500" />
                Enlaces Rápidos
              </h3>
              <div className="space-y-3">
                <a href="/ctma/inicio" className="block p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-orange-50 dark:hover:bg-zinc-700 hover:text-orange-700 dark:hover:text-orange-400 border border-transparent dark:border-zinc-700 transition-colors group">
                  <span className="block font-bold text-zinc-700 dark:text-slate-300 group-hover:text-orange-700 dark:group-hover:text-orange-400">CTMA Principal</span>
                  <span className="text-xs text-slate-500">Información del centro</span>
                </a>
                <a href="https://caprendizaje.sena.edu.co/sgva/SGVA_Diseno/pag/login.aspx" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-zinc-700 hover:text-emerald-700 dark:hover:text-emerald-400 border border-transparent dark:border-zinc-700 transition-colors group">
                  <span className="block font-bold text-zinc-700 dark:text-slate-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">SGVA</span>
                  <span className="text-xs text-slate-500">Sistema de Gestión Virtual de Aprendices</span>
                </a>
                <a href="https://betowa.sena.edu.co/" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-700 hover:text-blue-700 dark:hover:text-blue-400 border border-transparent dark:border-zinc-700 transition-colors group">
                  <span className="block font-bold text-zinc-700 dark:text-slate-300 group-hover:text-blue-700 dark:group-hover:text-blue-400">Betowa</span>
                  <span className="text-xs text-slate-500">Plataforma institucional</span>
                </a>
                <a href="http://senasofiaplus.edu.co/sofia-public/" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-sena-50 dark:hover:bg-zinc-700 hover:text-sena-600 dark:hover:text-sena-400 border border-transparent dark:border-zinc-700 transition-colors group">
                  <span className="block font-bold text-zinc-700 dark:text-slate-300 group-hover:text-sena-600 dark:group-hover:text-sena-400">Sofia Plus</span>
                  <span className="text-xs text-slate-500">Portal de oferta educativa</span>
                </a>
                <a href="https://sena.territorio.la/index.php?login=true" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-amber-50 dark:hover:bg-zinc-700 hover:text-amber-700 dark:hover:text-amber-400 border border-transparent dark:border-zinc-700 transition-colors group">
                  <span className="block font-bold text-zinc-700 dark:text-slate-300 group-hover:text-amber-700 dark:group-hover:text-amber-400">Territorium</span>
                  <span className="text-xs text-slate-500">Plataforma de aprendizaje</span>
                </a>
                <a href="https://ape.sena.edu.co/Paginas/Inicio.aspx" target="_blank" rel="noopener noreferrer" className="block p-4 rounded-xl bg-slate-50 dark:bg-zinc-900 hover:bg-teal-50 dark:hover:bg-zinc-700 hover:text-teal-700 dark:hover:text-teal-400 border border-transparent dark:border-zinc-700 transition-colors group">
                  <span className="block font-bold text-zinc-700 dark:text-slate-300 group-hover:text-teal-700 dark:group-hover:text-teal-400">Agencia de Empleo</span>
                  <span className="text-xs text-slate-500">APE - Vacantes disponibles</span>
                </a>
              </div>

              <h3 className="font-black text-zinc-800 dark:text-slate-200 mt-8 mb-5 flex items-center text-lg">
                <User className="w-5 h-5 mr-2 text-sena-500" />
                Contacto y Ayuda
              </h3>
              <div className="bg-sena-50/50 dark:bg-zinc-900 p-5 rounded-2xl border border-sena-100/50 dark:border-zinc-700">
                <p className="text-xs text-sena-900/80 dark:text-slate-400 mb-2 font-medium">¿Tienes dudas o necesitas información sobre el CTMA?</p>
                <div className="space-y-2 mt-4 text-sm font-bold text-indigo-950 dark:text-slate-200">
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-sena-500 mr-2"></span> Dirección: Calle 104 #69-120, Pedregal</p>
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-sena-500 mr-2"></span> Conmutador: (601) 5461500</p>
                  <p className="flex items-center"><span className="w-2 h-2 rounded-full bg-sena-500 mr-2"></span> Atención Nal: 018000 910270</p>
                </div>
              </div>

              {/* REDES SOCIALES CTMA */}
              <h3 className="font-black text-zinc-800 dark:text-slate-200 mt-8 mb-5 flex items-center text-lg">
                <svg className="w-5 h-5 mr-2 text-sena-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
                Redes Oficiales
              </h3>
              <div className="grid grid-cols-4 gap-2">
                <a href="https://www.facebook.com/SENAColombiaOficial/" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
                </a>
                <a href="https://twitter.com/senacomunica" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:bg-sky-100 dark:hover:bg-sky-900/40 text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
                </a>
                <a href="https://www.youtube.com/user/SENATV" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-slate-400 hover:text-red-600 dark:hover:text-red-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                </a>
                <a href="https://www.instagram.com/senacomunica" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center p-3 bg-slate-50 dark:bg-zinc-900 rounded-xl hover:bg-pink-100 dark:hover:bg-pink-900/40 text-slate-400 hover:text-pink-600 dark:hover:text-pink-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </a>
              </div>

              {/* VISITAS */}
              <div className="mt-8 p-5 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-2xl"></div>
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Visitas al Portal</h4>
                    <p className="text-2xl font-black tabular-nums tracking-tight">284,592</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-sena-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </div>
                </div>

                {/* LOGIN / LOGOUT BUTTON */}
                {session && (
                  <div className="mt-6">
                    <button onClick={() => signOut()} className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors">
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER INSTITUCIONAL */}
        <footer className="mt-16 pt-10 border-t border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-slate-500 text-sm">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6 mb-8">
            <div className="max-w-md text-center md:text-left">
              <h4 className="font-black text-zinc-800 dark:text-slate-300 text-lg mb-2">SENA Regional Antioquia</h4>
              <p className="font-medium">Centro de Tecnología de la Manufactura Avanzada (CTMA)</p>
              <p className="mt-2 text-xs">Transformando vidas y construyendo el futuro a través de la educación técnica y tecnológica de alta calidad.</p>
            </div>
            
            <div className="flex gap-4">
              <a href="https://www.facebook.com/SENA/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-sena-100 dark:hover:bg-sena-900 hover:text-sena-500 dark:hover:text-sena-400 transition-colors border border-transparent dark:border-zinc-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
              </a>
              <a href="https://twitter.com/SENAComunica" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900 hover:text-sky-500 dark:hover:text-sky-400 transition-colors border border-transparent dark:border-zinc-700">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
            </div>
          </div>
          <div className="text-center text-xs pb-8">
            <p>© {new Date().getFullYear()} SENA CTMA. Proyecto formativo. Todos los derechos reservados.</p>
          </div>
        </footer>

        {/* MODAL BIBLIOTECA DE RECURSOS */}
        {isResourcesOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-100 dark:border-zinc-700">
              <div className="bg-gradient-to-r from-sena-600 to-sena-500 p-6 flex justify-between items-center text-white shrink-0">
                <div className="flex items-center space-x-3">
                  <BookOpen className="w-6 h-6 text-sena-100" />
                  <h3 className="text-xl font-black">Biblioteca de Recursos Oficiales</h3>
                </div>
                <button aria-label="Cerrar modal" onClick={() => setIsResourcesOpen(false)} className="text-sena-200 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                  Descarga o consulta los reglamentos, guías y formatos oficiales del CTMA directamente desde aquí sin tener que navegar por múltiples páginas.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {officialResources.map((res, i) => (
                    <a 
                      key={i} 
                      href={res.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-start p-4 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 hover:bg-sena-50 dark:hover:bg-zinc-700 hover:border-sena-200 dark:hover:border-sena-500/50 transition-all group"
                    >
                      <div className="p-2 bg-white dark:bg-zinc-900 rounded-lg shadow-sm group-hover:bg-sena-500 group-hover:text-white text-slate-400 transition-colors mr-3 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-zinc-700 dark:text-slate-200 text-sm group-hover:text-sena-600 dark:group-hover:text-sena-300">{res.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase mt-1 flex items-center">
                          Ver Documento <Download className="w-3 h-3 ml-1" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL BUZON DE SUGERENCIAS */}
        {isSuggestionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden shrink-0 border border-slate-100 dark:border-zinc-800">
              <div className="bg-sena-500 p-6 flex justify-between items-center text-white">
                <div className="flex items-center space-x-3">
                  <MessageSquarePlus className="w-6 h-6 text-sena-200" />
                  <h3 className="text-xl font-black">Enviar Sugerencia</h3>
                </div>
                <button aria-label="Cerrar modal" onClick={() => setIsSuggestionOpen(false)} className="text-sena-200 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {successMessage ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-black text-zinc-800 dark:text-slate-200 mb-2">{successMessage}</h3>
                  <p className="text-slate-500 dark:text-slate-400">Cerrando ventana...</p>
                </div>
              ) : (
                <form onSubmit={handleSendSuggestion} className="p-6 md:p-8 space-y-6">
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    Usa este espacio para enviar sugerencias, preguntas o comentarios directamente a la administración del CTMA.
                  </p>
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Asunto</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Solicitud de información..." 
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 dark:text-slate-200 font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      required
                      disabled={isSending}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Categoría (Opcional)</label>
                    <select 
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 dark:text-slate-200 font-medium appearance-none transition-all"
                      value={newCategoryId}
                      onChange={e => setNewCategoryId(e.target.value)}
                      disabled={isSending}
                    >
                      <option value="">Selecciona un tema...</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Mensaje</label>
                    <textarea 
                      placeholder="Escribe tu sugerencia aquí..." 
                      className="w-full p-4 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl h-32 resize-none focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 dark:text-slate-200 font-medium transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      value={newContent}
                      onChange={e => setNewContent(e.target.value)}
                      required
                      disabled={isSending}
                    />
                  </div>

                  <div className="pt-4 flex justify-end space-x-3">
                    <button type="button" onClick={() => setIsSuggestionOpen(false)} className="px-6 py-3 font-bold text-slate-500 dark:text-slate-400 hover:text-zinc-700 dark:hover:text-slate-200 transition-colors" disabled={isSending}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSending} className="px-8 py-3 bg-sena-500 hover:bg-sena-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center disabled:opacity-50">
                      {isSending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full mr-2"></div>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
