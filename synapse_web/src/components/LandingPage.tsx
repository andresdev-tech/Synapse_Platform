import Link from "next/link"
import { ArrowRight, BookOpen, Shield, Cloud, Sparkles } from "lucide-react"

export function LandingPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-slate-50 to-indigo-50">
        <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full mb-8 text-sm font-medium animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>La nueva plataforma del SENA CTMA</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 max-w-4xl">
          El conocimiento de tu centro, <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
            organizado en un solo lugar.
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Synapse te permite gestionar tus apuntes, mantenerte al tanto de los anuncios globales del CTMA y estructurar tu aprendizaje como un profesional.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/?guest=true" className="group flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-500/30 transition-all">
            <span>Ingresar a la plataforma</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Todo lo que necesitas como Aprendiz</h2>
            <p className="text-slate-600">Herramientas diseñadas para maximizar tu productividad en el SENA.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-indigo-100 transition-all group">
              <div className="bg-indigo-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Apuntes Estructurados</h3>
              <p className="text-slate-600">Crea, edita y organiza tus notas personales con un sistema intuitivo de arrastrar y soltar.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all group">
              <div className="bg-emerald-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Cloud className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Sincronización en la Nube</h3>
              <p className="text-slate-600">Tus datos seguros y accesibles desde cualquier lugar, almacenados en nuestra base de datos en tiempo real.</p>
            </div>
            
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all group">
              <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Seguridad Profesional</h3>
              <p className="text-slate-600">Autenticación cifrada, recuperación por correo y separación estricta entre Administradores y Aprendices.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 text-center border-t border-slate-800">
        <p>© {new Date().getFullYear()} Synapse SENA CTMA. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
