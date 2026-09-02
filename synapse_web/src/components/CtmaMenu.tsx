import { ChevronDown } from "lucide-react"
import Link from "next/link"

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
  return (
    <nav className="hidden md:flex items-center space-x-1 ml-6">
      {menuItems.map((menu) => (
        <div key={menu.title} className="relative group">
          <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors">
            <span>{menu.title}</span>
            <ChevronDown className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <div className="absolute top-full left-0 mt-1 w-56 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl ring-1 ring-slate-900/5 overflow-hidden">
              {menu.links.map((link) => (
                <Link
                  key={link.name}
                  href={link.url}
                  className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ))}
      <Link 
        href="/ctma/directorio" 
        className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
      >
        Directorio
      </Link>
    </nav>
  )
}
