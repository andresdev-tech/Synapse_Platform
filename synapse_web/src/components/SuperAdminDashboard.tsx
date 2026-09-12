"use client"

import { useState, useEffect } from "react"
import {
  Activity,
  Users,
  Database,
  FileText,
  ArrowUpRight,
  BarChart3,
  Settings,
  UserPlus,
  Mail,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  Search,
  Plus,
  ChevronUp,
  RotateCcw,
  Sparkles,
  UserCheck,
  IdCard,
} from "lucide-react"

import { fetchApi } from "@/lib/fetchApi"

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 154,
    resourcesCount: 42,
    changesToday: 12,
    activeSessions: 8,
  })

  interface AdminUser {
    id: string
    name: string
    email: string
    role: string
    status: boolean | string
  }

  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: "1", name: "Carlos Alberto Restrepo", email: "carestrepo@sena.edu.co", role: "SUPER_ADMIN", status: true },
    { id: "2", name: "María Fernanda Gómez", email: "mfgomez@soy.sena.edu.co", role: "ADMIN", status: true },
    { id: "3", name: "Robinson Andrés Galeano", email: "ragaleano@soy.sena.edu.co", role: "ADMIN", status: true },
    { id: "4", name: "Diana Marcela Garzón", email: "dagarzonh@sena.edu.co", role: "EDITOR", status: true },
  ])

  // Estado para alternar la visualización del formulario
  const [registerAdmin, setRegisterAdmin] = useState(true)

  // Campos del formulario
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("ADMIN")
  const [status, setStatus] = useState("ACTIVE")

  // Estados de envío y feedback
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Carga de datos
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetchApi("/api/users")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            const mapped = data.map((u: any) => ({
              id: u.id,
              name: u.name || "Usuario del Sistema",
              email: u.email,
              role: u.role?.name || u.role || "ADMIN",
              status: u.status === "ACTIVE" || u.status === true || true,
            }))
            setAdmins(mapped)
          }
        }
      } catch (error) {
        console.warn("Usando datos de demostración para el directorio:", error)
      }
    }

    loadUsers()
  }, [])

  const handleReset = () => {
    setName("")
    setEmail("")
    setRole("ADMIN")
    setStatus("ACTIVE")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      setFeedback({
        type: "error",
        message: "El nombre y el correo institucional son obligatorios.",
      })
      return
    }

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const tempPassword = `Sena${new Date().getFullYear()}*!`

      const res = await fetchApi("/api/auth/createadmin", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: tempPassword,
          role,
          status: status === "ACTIVE",
        }),
      })

      console.log("STATUS:", res.status)
      console.log("CONTENT-TYPE:", res.headers.get("content-type"))

      if (!res.ok) {
        const text = await res.text()

        console.error("RESPUESTA DEL SERVIDOR:", text)

        throw new Error(
          `Error ${res.status}: No se pudo registrar el administrador`
        )
      }

      const data = await res.json()

      const newAdmin: AdminUser = {
        id: data.data?.id || `adm-${Date.now()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
        status: status === "ACTIVE",
      }

      setAdmins((prev) => [newAdmin, ...prev])

      setFeedback({
        type: "success",
        message: `¡Administrador institucional "${name}" registrado exitosamente en la plataforma SENA!`,
      })

      handleReset()
    } catch (err: any) {
      console.error("Error registrando administrador:", err)

      setFeedback({
        type: "error",
        message: err.message || "No se pudo registrar el administrador.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="mx-auto w-full min-w-0 space-y-6 overflow-hidden px-3 py-5 sm:space-y-8 sm:px-4 sm:py-8 md:px-8">
      {/* BANNER INSTITUCIONAL */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
          <Settings className="w-64 h-64 -mt-10 -mr-10" />
        </div>
        <div className="relative z-10">
          <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sena-400">
            <Settings className="h-4 w-4" /> PANEL DE CONTROL SUPER ADMIN · SENA
          </div>
          <h1 className="mb-2 text-2xl font-extrabold sm:text-4xl tracking-tight">Monitoreo General del Sistema</h1>
          <p className="text-base text-slate-400 sm:text-lg max-w-2xl">
            Supervisa los recursos RAG, actividad del centro y gestiona los administradores y accesos de Synapse.
          </p>
        </div>
      </div>

      {/* MONITORING SYSTEM */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sena-500" /> Estadísticas Visuales
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +12%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Usuarios Totales</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.usersCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-sena-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> +5%
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Recursos RAG</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.resourcesCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Cambios Hoy</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.changesToday}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Sesiones Activas</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.activeSessions}</h3>
          </div>
        </div>

        {/* MOCK VISUAL CHART */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-48 flex flex-col justify-center items-center text-center">
          <BarChart3 className="w-10 h-10 text-sena-300 mb-2" />
          <p className="text-slate-600 font-semibold text-sm">Monitoreo de Telemetría Activo</p>
          <p className="text-slate-400 text-xs">Métricas de interacción sincronizadas con el nodo local CTMA.</p>
        </div>
      </div>

      {/* FORMULARIO ESTILO SENA - GESTIÓN Y REGISTRO DE ADMINISTRADORES */}
      <div className="mt-10 space-y-6">
        {/* ENCABEZADO DE SECCIÓN Y TOGGLE */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-sena-500/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-sena-400 border border-sena-500/20">
                <ShieldCheck className="h-3.5 w-3.5" /> GESTIÓN DE ROLES INSTITUCIONALES
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Sistema de Registro de Administradores
              </h2>
              <p className="text-sm text-slate-400 max-w-xl">
                Alta y asignación de credenciales para instructores, coordinadores y personal administrativo SENA CTMA.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setRegisterAdmin(!registerAdmin)}
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${registerAdmin
                  ? "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                  : "bg-sena-500 text-white hover:bg-sena-600 shadow-sena-500/25 hover:scale-[1.02]"
                }`}
            >
              {registerAdmin ? (
                <>
                  <ChevronUp className="w-4 h-4" /> Ocultar Formulario
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" /> Nuevo Administrador
                </>
              )}
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL FORMULARIO CON ESTILO Y COLORES SENA */}
        {registerAdmin && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-all">
            {/* BARRA SUPERIOR CON DEGRADADO INSTITUCIONAL SENA */}
            <div className="h-2 w-full bg-gradient-to-r from-sena-600 via-sena-500 to-emerald-400" />

            {/* CABECERA DEL FORMULARIO */}
            <div className="border-b border-slate-100 bg-slate-50/70 p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sena-500 text-white flex items-center justify-center shadow-md shadow-sena-500/25">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Formulario Oficial de Alta Administrativa
                  </h3>
                  <p className="text-xs font-medium text-slate-500">
                    Complete la información requerida con dominios y datos válidos del centro.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg bg-sena-50 border border-sena-200 text-sena-800 text-xs font-bold">
                <Building className="w-3.5 h-3.5 text-sena-600" /> CTMA · Complejo Pedregal
              </div>
            </div>

            {/* FEEDBACK BANNER (SI EXISTE) */}
            {feedback && (
              <div
                className={`mx-6 sm:mx-8 mt-6 p-4 rounded-2xl flex items-start gap-3 border ${feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                  }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="text-sm font-semibold">{feedback.message}</div>
              </div>
            )}

            {/* FORMULARIO */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NOMBRES */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sena-600" /> Nombres <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Juan Carlos"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Nombres del funcionario o instructor.</p>
                </div>

                {/* CORREO INSTITUCIONAL */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sena-600" /> Correo Electrónico Institucional <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ejemplo@soy.sena.edu.co"
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">Preferiblemente @soy.sena.edu.co, @sena.edu.co o @gmail.com</p>
                </div>

                {/* ROL ASIGNADO */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sena-600" /> Rol y Nivel de Privilegios <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                    >
                      <option value="ADMIN">ADMIN - Administrador de Contenidos & RAG</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">Nivel de autorización institucional dentro del ecosistema Synapse.</p>
                </div>

                {/* ESTADO DE LA CUENTA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sena-600" /> Estado de la Cuenta <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                    >
                      <option value="ACTIVE">ACTIVO - Habilitado para operar de inmediato</option>
                      <option value="INACTIVE">INACTIVO - En espera de validación de credenciales</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">Controla si el administrador puede autenticarse actualmente.</p>
                </div>
              </div>

              {/* INFORMACIÓN INSTITUCIONAL DE SEDE */}
              <div className="rounded-2xl border border-sena-200 bg-sena-50/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-sena-900">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sena-600 shrink-0" />
                  <div>
                    <span className="font-extrabold text-sena-800">Centro Asignado: </span>
                    Centro de Tecnología de la Manufactura Avanzada (CTMA) · Regional Antioquia
                  </div>
                </div>
                <span className="inline-block px-2.5 py-1 rounded-md bg-white border border-sena-200 font-bold text-[11px] text-sena-700">
                  Synapse v2.0
                </span>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <RotateCcw className="w-4 h-4" /> Limpiar Campos
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-7 py-3 rounded-xl bg-sena-500 hover:bg-sena-600 active:scale-98 text-white font-extrabold text-sm shadow-lg shadow-sena-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-xl hover:shadow-sena-500/30"
                >
                  <UserPlus className="w-4 h-4" />
                  {isSubmitting ? "Registrando Administrador..." : "Registrar Administrador"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* DIRECTORIO Y LISTA DE ADMINISTRADORES REGISTRADOS */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800">Directorio de Administradores</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sena-100 text-sena-800 text-xs font-black">
                  {admins.length} Registrados
                </span>
              </div>
              <p className="text-xs text-slate-500">Cuentas con privilegios administrativos activos en la plataforma.</p>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, correo o rol..."
                className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium placeholder-slate-400 outline-none focus:border-sena-500 focus:bg-white focus:ring-2 focus:ring-sena-500/10 transition"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Administrador</th>
                  <th className="py-3.5 px-6">Correo Institucional</th>
                  <th className="py-3.5 px-6">Rol Asignado</th>
                  <th className="py-3.5 px-6">Estado</th>
                  <th className="py-3.5 px-6 text-right">Vinculación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      No se encontraron administradores con el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-sena-50/40 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sena-100 text-sena-800 flex items-center justify-center font-black text-xs border border-sena-200">
                          {admin.name
                            .split(" ")
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-800">{admin.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">ID: {admin.id}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {admin.email}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${admin.role === "SUPER_ADMIN"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : admin.role === "ADMIN"
                                ? "bg-sena-50 text-sena-800 border border-sena-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {admin.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Activo
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right text-xs font-semibold text-slate-500">
                        SENA CTMA
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

