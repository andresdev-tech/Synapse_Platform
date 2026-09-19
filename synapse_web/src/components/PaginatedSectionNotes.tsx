"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

interface SectionNote {
  id: string
  title: string
  section?: string
  seoImage?: string
  excerpt?: string
  body?: string
  createdAt: string
}

interface PaginatedSectionNotesProps {
  notes: SectionNote[]
  itemsPerPage?: number
  sectionTitle?: string
}

export function PaginatedSectionNotes({
  notes,
  itemsPerPage = 6,
  sectionTitle = "Anuncios y Novedades"
}: PaginatedSectionNotesProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(notes.length / itemsPerPage)

  const currentNotes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return notes.slice(startIndex, startIndex + itemsPerPage)
  }, [notes, currentPage, itemsPerPage])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    const el = document.getElementById("seccion-anuncios-ctma")
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  if (!notes || notes.length === 0) return null

  return (
    <div id="seccion-anuncios-ctma" className="mt-16 relative z-10 scroll-mt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
          <span className="w-8 h-1.5 bg-sena-500 rounded-full mr-4"></span>
          {sectionTitle}
          <span className="ml-3 px-2.5 py-0.5 text-xs font-semibold bg-sena-100 dark:bg-sena-900/40 text-sena-700 dark:text-sena-300 rounded-full">
            {notes.length} {notes.length === 1 ? "anuncio" : "anuncios"}
          </span>
        </h2>
        {totalPages > 1 && (
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Página {currentPage} de {totalPages}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full group"
          >
            {note.seoImage && (
              <div className="w-full h-48 overflow-hidden relative bg-slate-100 dark:bg-slate-900">
                <img
                  src={note.seoImage}
                  alt={note.title}
                  className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              {note.section && (
                <span className="text-xs font-bold text-sena-500 uppercase tracking-wider mb-2">
                  {note.section}
                </span>
              )}
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 leading-snug group-hover:text-sena-600 dark:group-hover:text-sena-400 transition-colors line-clamp-2">
                {note.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-6 line-clamp-3 leading-relaxed">
                {note.excerpt || (note.body ? note.body.substring(0, 150) + "..." : "")}
              </p>
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4">
                <span className="text-xs font-medium text-slate-400 flex items-center">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></span>
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/blogs/${note.id}`}
                  className="text-sm font-bold text-sena-600 dark:text-sena-400 hover:text-sena-800 dark:hover:text-sena-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  Leer más <ExternalLink className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Control de Paginación */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, notes.length)} de {notes.length} anuncios
          </p>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sena-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página anterior"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                totalPages > 6 &&
                page !== 1 &&
                page !== totalPages &&
                Math.abs(page - currentPage) > 1
              ) {
                if (page === 2 || page === totalPages - 1) {
                  return <span key={page} className="px-2 text-xs text-slate-400">...</span>
                }
                return null
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 text-xs font-bold rounded-xl transition-all ${
                    currentPage === page
                      ? "bg-sena-600 text-white shadow-md shadow-sena-600/30 scale-105"
                      : "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {page}
                </button>
              )
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-sena-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Página siguiente"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
