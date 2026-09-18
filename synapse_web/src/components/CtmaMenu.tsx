"use client"

import { ChevronDown, Menu, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const menuItems = [
  {
    title: "Nosotros",
    links: [
      { name: "Misión y Visión", url: "/ctma/mision-y-vision" },
      { name: "Promesa de Valor", url: "/ctma/promesa-de-valor" },
      { name: "Organigrama", url: "/ctma/organigrama" },
      { name: "Historia", url: "/ctma/historia" },
      { name: "Contáctenos", url: "/ctma/contactenos" },
      { name: "SIGA", url: "/ctma/siga" },
    ]
  },
  {
    title: "Aprendices",
    links: [
      { name: "Bienestar al Aprendiz", url: "/ctma/bienestar-al-aprendiz" },
      { name: "Etapa Productiva", url: "/ctma/etapa-productiva" },
      { name: "Administración Educativa", url: "/ctma/administracion-educativa" },
      { name: "ICFES Pruebas TYT", url: "/ctma/icfes-pruebas-tyt" },
      { name: "Biblioteca", url: "/ctma/biblioteca" },
      { name: "Cursos presenciales", url: "/ctma/cursos-presenciales" },
    ]
  },
  {
    title: "Programas",
    links: [
      { name: "Oferta Educativa", url: "/ctma/oferta-educativa" },
      { name: "Portafolio de Servicios", url: "/ctma/portafolio-de-servicios" },
      { name: "Formación Virtual", url: "/ctma/formacion-virtual" },
      { name: "Bilingüismo", url: "/ctma/bilinguismo" },
      { name: "Inscripciones", url: "/ctma/inscripciones" },
    ]
  },
  {
    title: "Servicios",
    links: [
      { name: "Certificación de Comp.", url: "/ctma/certificacion-competencias" },
      { name: "Alturas", url: "/ctma/alturas" },
    ]
  }
]

export const CtmaMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const toggleSection = (title: string) => {
    if (openSection === title) {
      setOpenSection(null);
    } else {
      setOpenSection(title);
    }
  }

  return (
    <>
      <nav className="hidden md:flex items-center space-x-1 ml-6">
        {menuItems.map((menu) => (
          <div key={menu.title} className="relative group">
            <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors">
              <span>{menu.title}</span>
              <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <div className="absolute top-full left-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[999]">
              <div className="py-2 bg-white dark:bg-zinc-800 rounded-xl shadow-xl ring-1 ring-zinc-900/5 overflow-hidden">
                {menu.links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.url}
                    prefetch={false}
                    className="block px-4 py-2 text-sm text-zinc-700 dark:text-slate-300 hover:bg-sena-50 dark:hover:bg-sena-900/30 hover:text-sena-500 dark:hover:text-sena-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </nav>

      <div className="md:hidden flex items-center">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors focus:outline-none"
          aria-label="Abrir menú"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 shadow-2xl md:hidden flex flex-col z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="flex flex-col py-4 px-6 space-y-2">
            {menuItems.map((menu) => (
              <div key={menu.title} className="flex flex-col border-b border-zinc-800/50 pb-2 mb-2 last:border-0">
                <button 
                  onClick={() => toggleSection(menu.title)}
                  className="flex justify-between items-center py-3 text-left font-medium text-slate-800 dark:text-slate-200 hover:text-sena-600 dark:hover:text-white w-full"
                >
                  <span className="text-base">{menu.title}</span>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-200 ${openSection === menu.title ? 'rotate-180 text-sena-400' : 'text-zinc-500'}`} />
                </button>
                
                {openSection === menu.title && (
                  <div className="flex flex-col pl-4 space-y-1 pb-2 border-l-2 border-zinc-800 ml-2 mt-1">
                    {menu.links.map((link) => (
                      <Link
                        key={link.name}
                        href={link.url}
                        prefetch={false}
                        onClick={() => setIsOpen(false)}
                        className="text-sm py-2 px-3 rounded-md text-slate-600 dark:text-zinc-400 hover:text-sena-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
