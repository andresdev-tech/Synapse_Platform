"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { Database, FileText, FolderOpen, Link2, Loader2, Plus, Search, ShieldCheck, Trash2, X } from "lucide-react"
import { fetchApi } from "@/lib/fetchApi"

interface RagResource {
  id: string
  name: string
  url: string
  mimeType?: string | null
  size?: number | null
  altText?: string | null
  createdAt: string
  chunks: number
  indexed: boolean
}

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return "Tamaño no indicado"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function SuperAdminDashboard() {
  const [resources, setResources] = useState<RagResource[]>([])
  const [query, setQuery] = useState("")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [form, setForm] = useState({ name: "", url: "", mimeType: "application/pdf", size: "", altText: "", content: "" })

  const loadResources = async () => {
    setIsLoading(true)
    setError("")
    try {
      const response = await fetchApi("/api/rag/resources")
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "No se pudo cargar el catálogo")
      setResources(Array.isArray(data) ? data : [])
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el catálogo")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const loadTimer = window.setTimeout(() => { void loadResources() }, 0)
    return () => window.clearTimeout(loadTimer)
  }, [])

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return resources
    return resources.filter((resource) => `${resource.name} ${resource.url} ${resource.altText || ""}`.toLowerCase().includes(normalizedQuery))
  }, [query, resources])

  const resetForm = () => {
    setForm({ name: "", url: "", mimeType: "application/pdf", size: "", altText: "", content: "" })
    setIsFormOpen(false)
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSaving(true)
    setError("")
    try {
      const response = await fetchApi("/api/rag/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, size: form.size ? Number(form.size) : null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "No se pudo guardar el documento")
      setResources((current) => [data, ...current])
      resetForm()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "No se pudo guardar el documento")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (resource: RagResource) => {
    if (!window.confirm(`¿Eliminar “${resource.name}” del catálogo RAG?`)) return
    setDeletingId(resource.id)
    setError("")
    try {
      const response = await fetchApi(`/api/rag/resources/${resource.id}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "No se pudo eliminar el documento")
      }
      setResources((current) => current.filter((item) => item.id !== resource.id))
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "No se pudo eliminar el documento")
    } finally {
      setDeletingId(null)
    }
  }

  const indexedCount = resources.filter((resource) => resource.indexed).length
  const pendingCount = resources.length - indexedCount

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-10 lg:py-9">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="relative overflow-hidden rounded-4xl bg-slate-950 px-6 py-8 text-white shadow-xl sm:px-9 sm:py-10">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full border-32 border-sena-500/20" />
          <div className="relative max-w-3xl">
            <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sena-300">
              <ShieldCheck className="h-4 w-4" /> SUPER ADMIN · RAG CONTROL CENTER
            </div>
            <h1 className="max-w-2xl text-3xl font-black tracking-tight sm:text-5xl">Base de conocimiento</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">Registra las fuentes documentales que alimentan Synapse y mantén bajo control el catálogo de recuperación.</p>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Fuentes totales</span><FolderOpen className="h-5 w-5 text-sena-600" /></div><p className="mt-3 text-3xl font-black">{resources.length}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Indexadas</span><Database className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-3xl font-black text-emerald-600">{indexedCount}</p></div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-500">Pendientes</span><FileText className="h-5 w-5 text-amber-500" /></div><p className="mt-3 text-3xl font-black text-amber-600">{pendingCount}</p></div>
        </section>

        {error && <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"><span>{error}</span><button type="button" onClick={() => setError("")} aria-label="Cerrar error"><X className="h-4 w-4" /></button></div>}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div><h2 className="text-xl font-black tracking-tight">Fuentes documentales</h2><p className="mt-1 text-sm text-slate-500">Administra URLs y documentos disponibles para indexación.</p></div>
            <button type="button" onClick={() => setIsFormOpen((open) => !open)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-sena-600 px-4 text-sm font-bold text-white transition hover:bg-sena-700 focus:outline-none focus:ring-2 focus:ring-sena-500 focus:ring-offset-2"><Plus className="h-4 w-4" /> Añadir fuente</button>
          </div>

          {isFormOpen && <form onSubmit={handleSubmit} className="grid gap-4 border-b border-slate-200 bg-slate-50 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2"><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="resource-name">Nombre del documento</label><input id="resource-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Manual de procedimientos CTMA" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sena-500 focus:ring-2 focus:ring-sena-100" /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="resource-url">URL de origen</label><input id="resource-url" required type="url" value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} placeholder="https://..." className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-sena-500 focus:ring-2 focus:ring-sena-100" /></div>
            <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="resource-type">Tipo MIME</label><select id="resource-type" value={form.mimeType} onChange={(event) => setForm({ ...form, mimeType: event.target.value })} className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sena-500"><option value="application/pdf">PDF</option><option value="text/plain">Texto</option><option value="text/html">HTML</option><option value="application/msword">Documento Word</option></select></div>
            <div><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="resource-size">Tamaño en bytes <span className="font-normal normal-case">(opcional)</span></label><input id="resource-size" type="number" min="0" value={form.size} onChange={(event) => setForm({ ...form, size: event.target.value })} placeholder="524288" className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sena-500" /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="resource-description">Descripción <span className="font-normal normal-case">(opcional)</span></label><textarea id="resource-description" rows={2} value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} placeholder="Qué información contiene esta fuente..." className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-sena-500" /></div>
            <div className="sm:col-span-2"><label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="resource-content">Contenido para el RAG</label><textarea id="resource-content" required rows={6} value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} placeholder="Pega aquí el texto que quieres dividir e indexar..." className="w-full resize-y rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm leading-6 outline-none focus:border-sena-500 focus:ring-2 focus:ring-sena-100" /></div>
            <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={resetForm} className="h-11 rounded-xl px-4 text-sm font-bold text-slate-600 hover:bg-slate-200">Cancelar</button><button disabled={isSaving} type="submit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-60">{isSaving && <Loader2 className="h-4 w-4 animate-spin" />} Guardar fuente</button></div>
          </form>}

          <div className="border-b border-slate-200 p-4 sm:p-5"><div className="relative max-w-md"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nombre o URL" className="h-11 w-full rounded-xl border border-slate-300 bg-slate-50 pl-10 pr-3 text-sm outline-none focus:border-sena-500 focus:ring-2 focus:ring-sena-100" /></div></div>

          {isLoading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="h-5 w-5 animate-spin text-sena-600" /> Cargando fuentes...</div> : filteredResources.length === 0 ? <div className="flex min-h-48 flex-col items-center justify-center px-6 text-center"><div className="mb-3 rounded-2xl bg-slate-100 p-3"><FolderOpen className="h-6 w-6 text-slate-400" /></div><p className="font-bold text-slate-700">{query ? "No hay coincidencias" : "Aún no hay fuentes documentales"}</p><p className="mt-1 text-sm text-slate-500">{query ? "Prueba con otro término de búsqueda." : "Añade la primera fuente para preparar tu base RAG."}</p></div> : <div className="divide-y divide-slate-100">
            {filteredResources.map((resource) => <article key={resource.id} className="flex flex-col gap-4 p-5 transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:p-6"><div className="flex min-w-0 items-start gap-3"><div className="mt-0.5 rounded-xl bg-red-50 p-2.5 text-red-500"><FileText className="h-5 w-5" /></div><div className="min-w-0"><h3 className="truncate font-bold text-slate-800">{resource.name}</h3><a href={resource.url} target="_blank" rel="noreferrer" className="mt-1 flex max-w-xl items-center gap-1 truncate text-xs text-sena-700 hover:underline"><Link2 className="h-3.5 w-3.5 shrink-0" />{resource.url}</a><p className="mt-2 text-xs text-slate-500">{resource.mimeType || "Documento"} · {formatBytes(resource.size)} · Añadido {new Date(resource.createdAt).toLocaleDateString("es-CO")}</p></div></div><div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${resource.indexed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{resource.indexed ? `${resource.chunks} chunks` : "Pendiente de indexar"}</span><button type="button" disabled={deletingId === resource.id} onClick={() => void handleDelete(resource)} aria-label={`Eliminar ${resource.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"><Trash2 className="h-4 w-4" /></button></div></article>)}
          </div>}
        </section>
      </div>
    </main>
  )
}
