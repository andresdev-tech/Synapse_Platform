"use client"

import { useState } from "react"
import { X, ZoomIn } from "lucide-react"

export function ImageZoom({ src, alt, className, loading }: { src: string, alt: string, className?: string, loading?: "lazy" | "eager" }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <div className="relative group/zoom cursor-pointer" onClick={() => setIsOpen(true)}>
        <img 
          src={src} 
          alt={alt} 
          className={className}
          loading={loading || "lazy"}
        />
        <div className="absolute inset-0 bg-black/0 group-hover/zoom:bg-black/20 transition-all duration-300 rounded-xl flex items-center justify-center opacity-0 group-hover/zoom:opacity-100">
          <div className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-semibold flex items-center shadow-lg transform translate-y-4 group-hover/zoom:translate-y-0 transition-all duration-300">
            <ZoomIn className="w-5 h-5 mr-2" />
            Ampliar
          </div>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 sm:p-10 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white hover:bg-white/20 transition-colors bg-white/10 p-3 rounded-full z-[101]"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar imagen"
          >
            <X className="w-8 h-8" />
          </button>
          <div className="relative w-full h-full flex items-center justify-center" onClick={() => setIsOpen(false)}>
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
        </div>
      )}
    </>
  )
}
