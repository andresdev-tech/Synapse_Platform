// Server Component — sin 'use client': Next.js pre-renderiza esta página
// en el servidor, reduciendo el bundle JS inicial al mínimo.
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, MessageSquare, ClipboardList, Users,
  ChevronRight, Sparkles, GraduationCap, Target, Award, Shield
} from 'lucide-react';

const equipo = [
  {
    nombre: 'Jhon Alexander Lenis Holguín',
    rol: 'Líder de Proyecto / Frontend & IA',
    descripcion: 'Líder encargado de la interfaz de usuario, integración de inteligencia artificial y coordinación general del proyecto.',
    foto: '/equipo/jhon.jpeg',
    iniciales: 'JH',
    color: 'bg-blue-600',
  },
  {
    nombre: 'Juan Andrés Jaramillo García',
    rol: 'Desarrollador Backend',
    descripcion: 'Responsable de la base de datos de programas y la lógica del servidor, APIs REST y conexión con Neon PostgreSQL.',
    foto: '/equipo/andres.jpeg',
    iniciales: 'JJ',
    color: 'bg-purple-600',
  },
  {
    nombre: 'Mariana Bastidas Quintero',
    rol: 'Analista de Requerimientos',
    descripcion: 'Encargada de la documentación técnica, validación de requerimientos y análisis de casos de uso del sistema.',
    foto: '/equipo/mariana.jpeg',
    iniciales: 'MB',
    color: 'bg-green-600',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── NAVBAR ─────────────────────────────────── */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap size={24} className="text-primary-600" />
            <span className="text-lg sm:text-2xl font-extrabold text-primary-700">SYNAPSE PLATFORM</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-gray-600 hover:text-primary-700 text-sm font-medium transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/registro" className="btn-primary text-sm px-4 sm:px-5 py-2 flex items-center gap-1.5">
              Registrarse <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────── */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 text-sm font-medium">
            <Sparkles size={14} className="text-yellow-300" />
            Plataforma con Inteligencia Artificial
          </div>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Bienvenido a <span className="text-blue-300">SYNAPSE PLATFORM</span>
          </h1>
          <p className="text-blue-100 text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
            Una plataforma inteligente que conecta personas con programas de
            formación técnica y tecnológica. Gestiona tu inscripción y accede
            a orientación personalizada con inteligencia artificial.
          </p>
        </div>
      </div>

      {/* ── SOBRE EL PROYECTO ──────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Sobre el Proyecto</h2>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
            SYNAPSE PLATFORM es una plataforma diseñada para orientar a los aprendices en sus procesos
            académicos y administrativos. A través de un ChatBot inteligente, brindamos una
            guía paso a paso para que el usuario sepa exactamente cómo realizar sus trámites
            de forma sencilla y eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: ClipboardList, color: 'bg-blue-100 text-blue-600',    title: 'Inscripciones',          desc: 'El ChatBot explica detalladamente cómo solicitar el ingreso a los programas de formación.' },
            { icon: BookOpen,      color: 'bg-purple-100 text-purple-600', title: 'Programas de Formación', desc: 'Ayuda a consultar y entender la oferta educativa disponible con horarios y modalidades.' },
            { icon: MessageSquare, color: 'bg-green-100 text-green-600',   title: 'Dudas y Preguntas',      desc: 'Resuelve inquietudes sobre datos personales, requisitos y éxito de inscripción.' },
            { icon: Users,         color: 'bg-orange-100 text-orange-600', title: 'Horarios',               desc: 'Guía al aprendiz sobre cómo consultar y seleccionar sus franjas horarias disponibles.' },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MISIÓN VISIÓN VALORES ──────────────────── */}
      <div className="bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">¿Quiénes somos?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Conoce los principios que guían el desarrollo de SYNAPSE PLATFORM</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Target, color: 'bg-blue-600',  title: 'Misión',  desc: 'Facilitar el acceso a la formación técnica y tecnológica mediante una plataforma digital moderna, intuitiva y accesible para todos.' },
              { icon: Award,  color: 'bg-purple-600', title: 'Visión',  desc: 'Ser la herramienta de referencia para la gestión académica digital, integrando IA para orientar a cada usuario en su camino formativo.' },
              { icon: Shield, color: 'bg-green-600',  title: 'Valores', desc: 'Transparencia, inclusión, innovación y compromiso con la calidad educativa. La formación técnica es el motor del desarrollo personal.' },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="text-center p-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 ${color}`}>
                  <Icon size={26} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ESTADÍSTICAS ───────────────────────────── */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-500">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { num: '20',   label: 'Programas disponibles' },
              { num: '7',    label: 'Sectores productivos' },
              { num: '3',    label: 'Modalidades de estudio' },
              { num: '100%', label: 'Gratuito' },
            ].map(({ num, label }) => (
              <div key={label}>
                <div className="text-5xl font-extrabold text-blue-200 mb-2">{num}</div>
                <div className="text-blue-100 text-sm font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EQUIPO ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Nuestro Equipo</h2>
          <p className="text-gray-500">Las personas detrás de SYNAPSE PLATFORM</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {equipo.map((m) => (
            <div key={m.nombre} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center hover:shadow-md transition-shadow">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                {/* Next.js Image: optimización WebP/AVIF + lazy loading automático */}
                <Image
                  src={m.foto}
                  alt={m.nombre}
                  width={96}
                  height={96}
                  className="rounded-full object-cover border-4 border-gray-100 shadow-md"
                  loading="lazy"
                />
              </div>
              <h3 className="font-bold text-gray-900 text-base mb-1">{m.nombre}</h3>
              <p className="text-primary-600 text-xs font-semibold uppercase tracking-wide mb-3">{m.rol}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{m.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────── */}
      <div className="bg-gray-950 text-gray-500 text-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-primary-500" />
            <span className="font-bold text-gray-300">SYNAPSE PLATFORM</span>
          </div>
          <p>© 2026 · Plataforma Académica · Todos los derechos reservados</p>
        </div>
      </div>

    </div>
  );
}