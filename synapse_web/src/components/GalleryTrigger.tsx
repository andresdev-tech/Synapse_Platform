"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { X, Images } from "lucide-react"
import { ImageZoom } from "./ImageZoom"

export function GalleryTrigger({ 
  coverImage, 
  title, 
  images,
  extraContent,
  buttonText
}: { 
  coverImage: string, 
  title: string, 
  images: string[],
  extraContent?: React.ReactNode,
  buttonText?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => { document.body.style.overflow = "auto" }
  }, [isOpen])

  return (
    <>
      <div className="relative group cursor-pointer w-full max-w-4xl mx-auto mt-10" onClick={() => setIsOpen(true)}>
        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
        <img 
          src={coverImage} 
          alt={title} 
          className="relative rounded-xl shadow-lg w-full bg-white p-4" 
          loading="lazy" 
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 rounded-xl">
          <div className="bg-pink-600 text-white px-8 py-4 rounded-full font-bold shadow-xl flex items-center transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Images className="w-6 h-6 mr-3" />
            {buttonText || `Ver ${images.length} ${images.length === 1 ? 'Actividad' : 'Actividades'}`}
          </div>
        </div>
      </div>

      {mounted && isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:p-6 pt-12 sm:pt-20 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto" 
          onClick={() => setIsOpen(false)}
        >
          {/* Caja del Modal (Empieza desde arriba) */}
          <div 
            className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-6xl flex flex-col mb-12 relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 rounded-t-2xl">
              <h3 className="text-xl sm:text-2xl font-bold text-white flex items-center">
                <Images className="w-6 h-6 mr-3 text-pink-500" />
                {title}
              </h3>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Contenido (Mosaico Masonry sin espacios huecos) */}
            <div className="p-4 sm:p-8">
              <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                {images.map((img, i) => (
                  <div key={i} className="break-inside-avoid relative group/item">
                    <ImageZoom 
                      src={img} 
                      alt={`Imagen ${i+1}`} 
                      className="w-full h-auto object-cover rounded-xl shadow-lg border border-slate-700 hover:border-pink-500/50 transition-colors bg-white/5" 
                    />
                  </div>
                ))}
              </div>
              
              {/* Contenido Adicional (ej: Botón PDF) */}
              {extraContent && (
                <div className="mt-8 pt-8 border-t border-slate-800 flex justify-center">
                  {extraContent}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
