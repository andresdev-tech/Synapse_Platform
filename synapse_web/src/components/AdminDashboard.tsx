"use client"
import { fetchApi } from "@/lib/fetchApi";

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Edit2, Trash2, Megaphone, Plus, Users, Image as ImageIcon, Tag, Activity } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface Note {
  id: string
  title: string
  content: string
  imageUrl?: string; attachments?: {type: string, url: string}[];
  isGlobal: boolean
  authorId: string
  categoryId?: string
  category?: { name: string }
  author?: { name: string; role: string }
  createdAt: string
  deletedAt?: string | null
}

export function AdminDashboard() {
  const { data: session } = useSession()
  const [globalNotes, setGlobalNotes] = useState<Note[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newCategoryId, setNewCategoryId] = useState(""); const [newAttachments, setNewAttachments] = useState<{type: string, url: string}[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractError, setExtractError] = useState(false)
  const [validImageUrl, setValidImageUrl] = useState<string | null>(null)
  
  const [activeTab, setActiveTab] = useState<"anuncios" | "sugerencias" | "categorias">("anuncios")
  const [suggestions, setSuggestions] = useState<Note[]>([])

  useEffect(() => {
    fetchGlobalNotes()
    fetchCategories()
    fetchSuggestions()
  }, [])

  const fetchSuggestions = async () => {
    try {
      const res = await fetchApi("/api/notes/suggestions")
      const data = await res.json()
      setSuggestions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching suggestions:", error)
    }
  }

  // Efecto mÃ¡gico para extraer imÃ¡genes de links automÃ¡ticamente
  useEffect(() => {
    const timer = setTimeout(async () => {
      setExtractError(false)
      setValidImageUrl(null)
      
      if (!newImageUrl || !newImageUrl.startsWith('http')) {
        return;
      }

      // Si parece una imagen normal, la damos por vÃ¡lida inmediatamente
      if (newImageUrl.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
        setValidImageUrl(newImageUrl)
        return;
      }

      // Si no tiene extensiÃ³n clara (ej. Google Images o link web), verificamos en el servidor
      setIsExtracting(true)
      try {
        const res = await fetchApi(`/api/extract-image?url=${encodeURIComponent(newImageUrl)}`)
        const data = await res.json()
        if (data.imageUrl) {
          setNewImageUrl(data.imageUrl) // Actualiza el input si extrajo algo nuevo
          setValidImageUrl(data.imageUrl) // Muestra la vista previa
        } else {
          setExtractError(true)
        }
      } catch (e) {
        console.error("No se pudo verificar la imagen", e)
        setExtractError(true)
      } finally {
        setIsExtracting(false)
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [newImageUrl])

  const fetchCategories = async () => {
    try {
      const res = await fetchApi("/api/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(Array.isArray(data) ? data : [])
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchGlobalNotes = async () => {
    try {
      const res = await fetchApi("/api/notes")
      const data = await res.json()
      setGlobalNotes(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching global notes:", error)
    }
  }

  const handleSaveNote = async () => {
    if (!newTitle.trim() || !newContent.trim()) return

    const payload = {
      title: newTitle.trim(),
      content: newContent.trim(),
      imageUrl: newImageUrl.trim() || null, attachments: newAttachments,
      categoryId: newCategoryId || null,
      isGlobal: true,
      published: true,
      authorId: session?.user?.id
    }

    try {
      if (editingId) {
        await fetchApi(`/api/notes/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      } else {
        await fetchApi("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        })
      }
      
      setNewTitle("")
      setNewContent("")
      setNewImageUrl("")
      setNewCategoryId(""); setNewAttachments([]);
      setEditingId(null)
      setIsFormOpen(false)
      fetchGlobalNotes()
    } catch (error) {
      console.error("Error saving note:", error)
    }
  }

  const handleEdit = (note: Note) => {
    setNewTitle(note.title)
    setNewContent(note.content)
    setNewImageUrl(note.imageUrl || "")
    setNewCategoryId(note.categoryId || ""); setNewAttachments(note.attachments || []);
    setEditingId(note.id)
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Â¿Eliminar este anuncio global?")) return
    try {
      await fetchApi(`/api/notes/${id}`, { method: "DELETE" })
      fetchGlobalNotes()
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  return (
    <div className="w-full mx-auto space-y-8 px-4 md:px-8 py-8">
      {/* BANNER DE BIENVENIDA */}
      <div className="bg-gradient-to-r from-sena-600 via-sena-500 to-sena-400 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <svg width="400" height="400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        </div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold mb-2">Panel de Control General</h1>
          <p className="text-sena-100 text-lg">Administra los anuncios, notas y recursos de Synapse CTMA.</p>
        </div>
      </div>

      {/* HEADER ESTADISTICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex items-center space-x-5 relative overflow-hidden">
          <div className="absolute w-2 h-full bg-blue-500 left-0 top-0"></div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Anuncios</p>
            <h3 className="text-3xl font-extrabold text-zinc-800">{globalNotes.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex items-center space-x-5 relative overflow-hidden">
          <div className="absolute w-2 h-full bg-purple-500 left-0 top-0"></div>
          <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
            <Tag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Categorias</p>
            <h3 className="text-3xl font-extrabold text-zinc-800">{categories.length}</h3>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow border border-slate-100 flex items-center space-x-5 relative overflow-hidden">
          <div className="absolute w-2 h-full bg-emerald-500 left-0 top-0"></div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <Activity className="w-8 h-8" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estado</p>
            <h3 className="text-3xl font-extrabold text-zinc-800 flex items-center">
              En linea
              <span className="ml-2 w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></span>
            </h3>
          </div>
        </div>
      </div>

      {/* TABS DE NAVEGACION */}
      <div className="flex space-x-2 border-b border-slate-200 mb-6 px-4">
        <button 
          onClick={() => setActiveTab("anuncios")}
          className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 ${activeTab === "anuncios" ? "text-sena-500 border-sena-500" : "text-slate-500 border-transparent hover:text-zinc-700"}`}
        >
          ANUNCIOS OFICIALES
        </button>
        <button 
          onClick={() => setActiveTab("categorias")}
          className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 ${activeTab === "categorias" ? "text-sena-500 border-sena-500" : "text-slate-500 border-transparent hover:text-zinc-700"}`}
        >
          ADMINISTRAR CATEGORÍAS
        </button>
        <button 
          onClick={() => setActiveTab("sugerencias")}
          className={`pb-4 px-4 font-bold text-sm tracking-wide transition-colors border-b-2 flex items-center space-x-2 ${activeTab === "sugerencias" ? "text-sena-500 border-sena-500" : "text-slate-500 border-transparent hover:text-zinc-700"}`}
        >
          <span>BUZÓN DE SUGERENCIAS</span>
          {suggestions.length > 0 && (
            <span className="bg-sena-100 text-sena-600 py-0.5 px-2 rounded-full text-xs">{suggestions.length}</span>
          )}
        </button>
      </div>

            {activeTab === "categorias" ? (
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-sena-100/50 border border-slate-100">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Administrar Categorías</h2>
              <p className="text-slate-500 mt-1">Crea nuevas categorías para organizar los anuncios y recursos del portal.</p>
            </div>
          </div>
          
          <div className="mb-8 p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <h3 className="text-lg font-bold text-zinc-800 mb-4">Añadir nueva categoría</h3>
            <div className="flex gap-4">
              <input 
                type="text" 
                id="newCategoryName"
                placeholder="Ej. Bienestar, Eventos, Académico..." 
                className="flex-1 p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sena-500 focus:border-sena-500 outline-none"
              />
              <button 
                onClick={async () => {
                  const input = document.getElementById('newCategoryName') as HTMLInputElement;
                  if (!input || !input.value.trim()) return;
                  try {
                    await fetchApi('/api/categories', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name: input.value.trim() })
                    });
                    input.value = '';
                    fetchCategories();
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="bg-sena-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-sena-600 transition-colors flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear Categoría
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-bold text-zinc-800 mb-4">Categorías existentes ({categories.length})</h3>
            {categories.map(cat => (
              <div key={cat.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-shadow group">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-lg bg-sena-50 flex items-center justify-center mr-4">
                    <Tag className="w-5 h-5 text-sena-500" />
                  </div>
                  <span className="font-bold text-zinc-700">{cat.name}</span>
                </div>
                <button 
                  onClick={async () => {
                    if(!confirm('¿Eliminar esta categoría? Se desvinculará de los anuncios que la tengan.')) return;
                    await fetchApi('/api/categories/' + cat.id, { method: 'DELETE' });
                    fetchCategories();
                  }}
                  className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Eliminar categoría"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === "sugerencias" ? (
        <div className="bg-white p-8 rounded-3xl shadow-lg shadow-sena-100/50 border border-slate-100">
          <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 tracking-tight">Bandeja de Entrada</h2>
              <p className="text-slate-500 mt-1">Lee los mensajes, preguntas y sugerencias enviadas por los aprendices.</p>
            </div>
          </div>
          
          {suggestions.length === 0 ? (
            <div className="text-center py-20 px-4 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
              <Megaphone className="w-16 h-16 text-slate-300 mx-auto mb-5" />
              <h3 className="text-xl font-bold text-zinc-700 mb-2">Buzón vacío</h3>
              <p className="text-slate-500 text-sm">No hay nuevas sugerencias por parte de los aprendices.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {Object.entries(
                suggestions.reduce((acc, sug) => {
                  const cat = sug.category?.name || "Sin Categoría";
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(sug);
                  return acc;
                }, {} as Record<string, typeof suggestions>)
              ).map(([categoryName, group]) => (
                <div key={categoryName}>
                  <h3 className="text-lg font-black text-zinc-800 mb-4 flex items-center border-b border-slate-100 pb-2">
                    <span className="w-2 h-2 bg-sena-500 rounded-full mr-3"></span>
                    {categoryName}
                    <span className="ml-3 text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">{group.length}</span>
                  </h3>
                  <div className="grid gap-4">
                    {group.map(sug => (
                      <div key={sug.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-sena-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex flex-col">
                            <h4 className="font-extrabold text-zinc-800 text-lg">{sug.title}</h4>
                          </div>
                          <span className="text-xs text-slate-400 font-bold uppercase">{new Date(sug.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-600 text-sm mb-4 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">{sug.content}</p>
                        <div className="flex justify-between items-center text-xs">
                          <div className="font-medium text-slate-500">Enviado por: <span className="text-zinc-800 font-bold">{sug.author?.name || "Desconocido"}</span></div>
                          <button onClick={async () => {
                            if (confirm("¿Eliminar esta sugerencia?")) {
                              await fetchApi(`/api/notes/${sug.id}`, { method: "DELETE" });
                              fetchSuggestions();
                            }
                          }} className="text-red-500 hover:text-red-700 font-bold flex items-center bg-red-50 p-2 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4 mr-1" /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
      /* SECCIÓN PRINCIPAL */
      <div className="bg-white p-8 rounded-3xl shadow-lg shadow-sena-100/50 border border-slate-100">
        <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-2xl font-extrabold text-zinc-900 flex items-center">
              <Megaphone className="w-6 h-6 mr-3 text-sena-500" />
              Gestion de Anuncios
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-9">Publica y administra el contenido que ven los aprendices.</p>
          </div>
          <button 
            onClick={() => {
              setEditingId(null)
              setNewTitle("")
              setNewContent("")
              setNewImageUrl("")
              setNewCategoryId(""); setNewAttachments([]);
              setIsFormOpen(!isFormOpen)
            }}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md ${isFormOpen ? 'bg-slate-100 text-zinc-700 hover:bg-slate-200' : 'bg-sena-500 text-white hover:bg-sena-600 hover:shadow-sena-200 hover:-translate-y-0.5'}`}
          >
            {isFormOpen ? "Cerrar Panel" : <><Plus className="w-5 h-5" /> <span>Crear Nuevo</span></>}
          </button>
        </div>

        {/* FORMULARIO */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isFormOpen ? "max-h-[800px] opacity-100 mb-8" : "max-h-0 opacity-0"}`}>
          <div className="bg-slate-50/80 p-8 rounded-3xl border border-slate-200 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Titulo del Anuncio</label>
                <input 
                  type="text" 
                  placeholder="Ej. Inscripciones Abiertas 2026..." 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 font-medium transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Categoria</label>
                <select 
                  className="w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 font-medium transition-all appearance-none"
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                >
                  <option value="">-- Selecciona una categori­a --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">URL de la Imagen (Opcional)</label>
                  <div className="relative">
                    <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="url" 
                      placeholder="https://ejemplo.com/imagen.jpg o link del blog..." 
                      className="w-full pl-12 p-4 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none text-zinc-800 transition-all font-medium"
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* VISTA PREVIA */}
                {validImageUrl ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative h-32 bg-slate-100 flex items-center justify-center">
                    <img src={validImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      setExtractError(true);
                      setValidImageUrl(null);
                    }} />
                    <span className="absolute text-xs font-bold bg-black/50 text-white px-2 py-1 rounded bottom-2 right-2">Vista Previa</span>
                  </div>
                ) : newImageUrl ? (
                  <div className={`rounded-xl border p-4 text-xs font-medium flex items-center ${extractError ? 'border-red-200 bg-red-50 text-red-700' : 'border-sena-200 bg-sena-50 text-sena-600'}`}>
                    {isExtracting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-sena-600 mr-2"></div>
                        <span>Verificando enlace magicamente...</span>
                      </>
                    ) : extractError ? (
                      <>
                        <Activity className="w-4 h-4 mr-2" />
                        <span>No se encontra ninguna imagen valida en este enlace.</span>
                      </>
                    ) : (
                      <>
                        <div className="animate-pulse rounded-full h-2 w-2 bg-sena-500 mr-3"></div>
                        <span>Procesando enlace...</span>
                      </>
                    )}
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Contenido Detallado</label>
                <textarea 
                  placeholder="Escribe toda la informaciÃ³n relevante aquÃ­..." 
                  className="w-full p-5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-sena-500/20 focus:border-sena-500 outline-none min-h-[160px] h-full resize-y text-zinc-800 transition-all font-medium"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Multimedias y Enlaces Adjuntos (Videos, PDFs, Más imágenes)</label>
                <div className="space-y-3">
                  {newAttachments.map((att, idx) => (
                    <div key={idx} className="flex gap-2">
                      <select 
                        value={att.type} 
                        onChange={(e) => {
                          const n = [...newAttachments];
                          n[idx].type = e.target.value;
                          setNewAttachments(n);
                        }} 
                        className="p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-sena-500"
                      >
                        <option value="image">Imagen</option>
                        <option value="pdf">Documento PDF</option>
                        <option value="video">Video (YouTube/Vimeo)</option>
                      </select>
                      <input 
                        type="text" 
                        value={att.url} 
                        onChange={(e) => {
                          const n = [...newAttachments];
                          n[idx].url = e.target.value;
                          setNewAttachments(n);
                        }}
                        placeholder="https://... o pega el código <iframe..."
                        className="flex-1 p-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-sena-500"
                      />
                      <div className="flex flex-col sm:flex-row gap-1">
                        <button 
                          onClick={() => {
                            if (idx === 0) return;
                            const n = [...newAttachments];
                            [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
                            setNewAttachments(n);
                          }} 
                          disabled={idx === 0}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover Arriba"
                        >
                          ↑
                        </button>
                        <button 
                          onClick={() => {
                            if (idx === newAttachments.length - 1) return;
                            const n = [...newAttachments];
                            [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
                            setNewAttachments(n);
                          }} 
                          disabled={idx === newAttachments.length - 1}
                          className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Mover Abajo"
                        >
                          ↓
                        </button>
                        <button onClick={() => {
                          const n = [...newAttachments];
                          n.splice(idx, 1);
                          setNewAttachments(n);
                        }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Eliminar">X</button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setNewAttachments([...newAttachments, { type: "image", url: "" }])}
                    className="text-sm font-bold text-sena-600 hover:text-sena-700 bg-sena-50 px-4 py-2 rounded-lg transition-colors border border-sena-200 border-dashed w-full md:w-auto"
                  >
                    + Agregar Archivo o Enlace Adjunto
                  </button>
                </div>
              </div>
            
            <div className="flex justify-end pt-4">
              <button 
                onClick={handleSaveNote}
                disabled={!newTitle.trim() || !newContent.trim()}
                className="bg-sena-900 text-white px-8 py-4 rounded-xl font-bold hover:bg-sena-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-sena-900/20 hover:-translate-y-0.5"
              >
                {editingId ? "Actualizar Anuncio" : "Publicar Anuncio Ahora"}
              </button>
            </div>
          </div>
        </div>

        {/* LISTADO */}
        {globalNotes.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-50/50 rounded-3xl border-2 border-slate-100 border-dashed">
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 mb-5">
              <Megaphone className="w-10 h-10 text-sena-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-800">No hay anuncios publicados</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto">Haz clic en "Crear Nuevo" para publicar el primer anuncio oficial del centro.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {globalNotes.map(note => (
              <div key={note.id} className={`group bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:border-sena-200 hover:shadow-xl hover:shadow-sena-100/40 transition-all duration-300 flex flex-col relative overflow-hidden hover:-translate-y-1 ${note.deletedAt ? 'opacity-60 grayscale' : ''}`}>
                
                {note.deletedAt && (
                  <div className="absolute top-4 right-4 z-10 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-sm">
                    Eliminado
                  </div>
                )}

                {note.imageUrl && (
                  <div className="h-40 -mx-6 -mt-6 mb-5 bg-slate-100 overflow-hidden relative">
                    <img 
                      src={note.imageUrl} 
                      alt={note.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/40 to-transparent"></div>
                  </div>
                )}
                
                <div className="flex-1">
                  {note.category && (
                    <span className="inline-block px-3 py-1 bg-sena-50 text-sena-600 text-xs font-bold rounded-lg mb-3 uppercase tracking-wider">
                      {note.category.name}
                    </span>
                  )}
                  <h3 className="font-extrabold text-zinc-900 text-xl mb-3 leading-tight">{note.title}</h3>
                  <p className="text-slate-600 text-sm line-clamp-3 mb-4 leading-relaxed">{note.content}</p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100/80">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                  {!note.deletedAt && (
                    <div className="flex space-x-2">
                      <button onClick={() => handleEdit(note)} className="p-2.5 text-slate-400 hover:text-sena-500 hover:bg-sena-50 rounded-xl transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(note.id)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )}
    </div>
  )
}


