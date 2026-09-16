"use client"

import { useState, useEffect, useCallback } from "react"
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
  Clock,
  ListFilter,
  RefreshCw,
  Info,
  Key,
} from "lucide-react"

import { fetchApi } from "@/lib/fetchApi"

interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: boolean | string
}

interface AuditLogItem {
  id: string
  actorId?: string | null
  action: string
  entity: string
  entityId?: string | null
  metadata?: any
  createdAt: string
  actor?: {
    id: string
    name?: string | null
    email: string
  } | null
}

interface RoleItem {
  id: string
  name: string
  description?: string | null
  createdAt: string
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    resourcesCount: 0,
    changesToday: 0,
    activeSessions: 0,
  })

  const [admins, setAdmins] = useState<AdminUser[]>([
    { id: "1", name: "Carlos Alberto Restrepo", email: "carestrepo@sena.edu.co", role: "SUPER_ADMIN", status: true },
    { id: "2", name: "María Fernanda Gómez", email: "mfgomez@soy.sena.edu.co", role: "ADMIN", status: true },
    { id: "3", name: "Robinson Andrés Galeano", email: "ragaleano@soy.sena.edu.co", role: "ADMIN", status: true },
    { id: "4", name: "Diana Marcela Garzón", email: "dagarzonh@sena.edu.co", role: "EDITOR", status: true },
  ])

  // Estado de Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditActionFilter, setAuditActionFilter] = useState("ALL")
  const [auditSearchTerm, setAuditSearchTerm] = useState("")

  // Estado de Roles en Base de Datos
  const [dbRoles, setDbRoles] = useState<RoleItem[]>([])
  const [newRoleName, setNewRoleName] = useState("ADMIN")
  const [newRoleDesc, setNewRoleDesc] = useState("")
  const [roleSubmitting, setRoleSubmitting] = useState(false)
  const [roleFeedback, setRoleFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Estado para alternar la visualización del formulario
  const [registerAdmin, setRegisterAdmin] = useState(true)

  // Campos del formulario de administración
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("ADMIN")
  const [status, setStatus] = useState("ACTIVE")

  // Estados de envío y feedback
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Cargar lista de usuarios
  const loadUsers = useCallback(async () => {
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
          setStats((prev) => ({ ...prev, usersCount: mapped.length }))
        }
      }
    } catch (error) {
      console.warn("Usando datos por defecto para el directorio:", error)
    }
  }, [])

  // Cargar Audit Logs reales desde el Backend
  const loadAuditLogs = useCallback(async () => {
    setAuditLoading(true)
    try {
      const res = await fetchApi("/api/audit-logs?limit=50")
      if (res.ok) {
        const result = await res.json()
        const logs: AuditLogItem[] = result.data?.logs || []
        setAuditLogs(logs)

        const todayStr = new Date().toISOString().split("T")[0]
        const todayLogs = logs.filter((l) => l.createdAt.startsWith(todayStr))
        const loginLogs = logs.filter((l) => l.action === "LOGIN")

        setStats((prev) => ({
          ...prev,
          changesToday: todayLogs.length,
          activeSessions: loginLogs.length,
          resourcesCount: logs.length,
        }))
      }
    } catch (error) {
      console.error("Error al cargar los logs de auditoría:", error)
    } finally {
      setAuditLoading(false)
    }
  }, [])

  // Cargar Roles de la BD
  const loadRoles = useCallback(async () => {
    try {
      const res = await fetchApi("/api/roles")
      if (res.ok) {
        const result = await res.json()
        setDbRoles(result.data || [])
      }
    } catch (err) {
      console.warn("Error al cargar roles:", err)
    }
  }, [])

  useEffect(() => {
    loadUsers()
    loadAuditLogs()
    loadRoles()
  }, [loadUsers, loadAuditLogs, loadRoles])

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

      if (!res.ok) {
        throw new Error(`Error ${res.status}: No se pudo registrar el administrador`)
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
      loadAuditLogs()
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

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRoleName.trim()) return

    setRoleSubmitting(true)
    setRoleFeedback(null)
    try {
      const res = await fetchApi("/api/roles", {
        method: "POST",
        body: JSON.stringify({
          name: newRoleName.trim(),
          description: newRoleDesc.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || "No se pudo registrar el rol")
      }

      setRoleFeedback({
        type: "success",
        message: `¡Rol "${newRoleName}" registrado/actualizado exitosamente en la base de datos!`,
      })
      setNewRoleDesc("")
      loadRoles()
      loadAuditLogs()
    } catch (err: any) {
      setRoleFeedback({
        type: "error",
        message: err.message || "Error al registrar el rol",
      })
    } finally {
      setRoleSubmitting(false)
    }
  }

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesAction = auditActionFilter === "ALL" || log.action === auditActionFilter
    const actorName = log.actor?.name || log.actor?.email || log.actorId || ""
    const matchesSearch =
      actorName.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      log.entity.toLowerCase().includes(auditSearchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearchTerm.toLowerCase())
    return matchesAction && matchesSearch
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "LOGOUT":
        return "bg-slate-100 text-slate-700 border-slate-200"
      case "CREATE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200"
      case "UPDATE":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "DELETE":
        return "bg-rose-50 text-rose-700 border-rose-200"
      default:
        return "bg-purple-50 text-purple-700 border-purple-200"
    }
  }

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
            Supervisa los logs de auditoría global, roles en la base de datos y gestiona la administración de Synapse.
          </p>
        </div>
      </div>

      {/* MONITORING SYSTEM */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-sena-500" /> Estadísticas Generales del Sistema
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> Activo
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Usuarios Totales</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.usersCount || admins.length}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-sena-600 rounded-xl">
                <Database className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-green-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 mr-1" /> Total
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Eventos Auditados</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.resourcesCount}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Acciones Hoy</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.changesToday}</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col hover:border-sena-200 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Inicios de Sesión</p>
            <h3 className="text-3xl font-black text-slate-800 mt-1">{stats.activeSessions}</h3>
          </div>
        </div>
      </div>

      {/* SECCIÓN DE GESTIÓN DE ROLES EN LA BASE DE DATOS */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-sena-600" />
            <h3 className="text-lg font-black text-slate-800">Creación y Registro de Roles en Base de Datos</h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-black">
            Exclusivo SuperAdmin
          </span>
        </div>

        {roleFeedback && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 border text-sm font-semibold ${
              roleFeedback.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {roleFeedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            {roleFeedback.message}
          </div>
        )}

        <form onSubmit={handleCreateRole} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Nombre del Rol</label>
            <select
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-800 outline-none focus:border-sena-500"
            >
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              <option value="ADMIN">ADMIN</option>
              <option value="USER">USER</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">Descripción (Opcional)</label>
            <input
              type="text"
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              placeholder="Ej. Administrador con permisos globales"
              className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none focus:border-sena-500"
            />
          </div>

          <button
            type="submit"
            disabled={roleSubmitting}
            className="h-11 px-6 rounded-xl bg-sena-500 hover:bg-sena-600 text-white font-extrabold text-sm shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {roleSubmitting ? "Registrando Rol..." : "Registrar Rol en DB"}
          </button>
        </form>

        {dbRoles.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Roles registrados en la BD:</span>
            {dbRoles.map((r) => (
              <span
                key={r.id}
                className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-black text-slate-700 flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3 text-sena-600" />
                {r.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN DE REGISTROS DE AUDITORÍA GLOBAL (AUDIT LOGS) */}
      <div className="space-y-6 mt-10">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-sena-600" />
                <h3 className="text-lg font-black text-slate-800">Historial de Auditoría Global (Audit Logs)</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-sena-100 text-sena-800 text-xs font-black">
                  SuperAdmin
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Registro de acciones, inicios de sesión y modificaciones en la plataforma Synapse.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <select
                  value={auditActionFilter}
                  onChange={(e) => setAuditActionFilter(e.target.value)}
                  className="h-10 pl-3 pr-8 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 outline-none focus:border-sena-500 focus:bg-white"
                >
                  <option value="ALL">Todas las acciones</option>
                  <option value="LOGIN">LOGIN</option>
                  <option value="CREATE">CREATE</option>
                  <option value="UPDATE">UPDATE</option>
                  <option value="DELETE">DELETE</option>
                  <option value="ROLE_CHANGE">ROLE_CHANGE</option>
                  <option value="LOGOUT">LOGOUT</option>
                </select>
              </div>

              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={auditSearchTerm}
                  onChange={(e) => setAuditSearchTerm(e.target.value)}
                  placeholder="Buscar por usuario o entidad..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium placeholder-slate-400 outline-none focus:border-sena-500 focus:bg-white transition"
                />
              </div>

              <button
                type="button"
                onClick={loadAuditLogs}
                disabled={auditLoading}
                className="h-10 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                title="Actualizar logs de auditoría"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${auditLoading ? "animate-spin text-sena-600" : ""}`} />
                Actualizar
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-6">Actor / Usuario</th>
                  <th className="py-3.5 px-6">Acción</th>
                  <th className="py-3.5 px-6">Entidad</th>
                  <th className="py-3.5 px-6">Detalles / Metadata</th>
                  <th className="py-3.5 px-6 text-right">Fecha y Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLoading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sena-500" />
                      Cargando registros de auditoría...
                    </td>
                  </tr>
                ) : filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                      No se registraron eventos de auditoría que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map((log) => {
                    const dateFormatted = new Date(log.createdAt).toLocaleString("es-CO", {
                      dateStyle: "short",
                      timeStyle: "medium",
                    })
                    const actorDisplay = log.actor?.name || log.actor?.email || log.actorId || "Sistema"

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs border border-slate-200">
                              {actorDisplay.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800">{actorDisplay}</div>
                              {log.actor?.email && (
                                <div className="text-[10px] text-slate-400 font-normal">{log.actor.email}</div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${getActionBadge(
                              log.action
                            )}`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs font-semibold text-slate-700">
                          <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-600 font-mono">
                            {log.entity}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-xs text-slate-500 max-w-xs truncate">
                          {log.metadata ? (
                            <span className="font-mono text-[11px] bg-slate-50 px-2 py-1 rounded border border-slate-200 inline-block max-w-xs truncate">
                              {JSON.stringify(log.metadata)}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-italic">Sin metadatos</span>
                          )}
                        </td>

                        <td className="py-4 px-6 text-right text-xs font-medium text-slate-500 flex items-center justify-end gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400 inline" />
                          {dateFormatted}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FORMULARIO ESTILO SENA - GESTIÓN Y REGISTRO DE ADMINISTRADORES */}
      <div className="mt-10 space-y-6">
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
              className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${
                registerAdmin
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

        {registerAdmin && (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl transition-all">
            <div className="h-2 w-full bg-gradient-to-r from-sena-600 via-sena-500 to-emerald-400" />

            <div className="border-b border-slate-100 bg-slate-50/70 p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-sena-500 text-white flex items-center justify-center shadow-md shadow-sena-500/25">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800">Formulario Oficial de Alta Administrativa</h3>
                  <p className="text-xs font-medium text-slate-500">
                    Complete la información requerida con dominios y datos válidos del centro.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-1.5 self-start sm:self-center px-3 py-1.5 rounded-lg bg-sena-50 border border-sena-200 text-sena-800 text-xs font-bold">
                <Building className="w-3.5 h-3.5 text-sena-600" /> CTMA · Complejo Pedregal
              </div>
            </div>

            {feedback && (
              <div
                className={`mx-6 sm:mx-8 mt-6 p-4 rounded-2xl flex items-start gap-3 border ${
                  feedback.type === "success"
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

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-sena-600" /> Nombres <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Juan Carlos"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                  />
                  <p className="text-[11px] text-slate-400">Nombres del funcionario o instructor.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sena-600" /> Correo Electrónico Institucional{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@soy.sena.edu.co"
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 placeholder-slate-400 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                  />
                  <p className="text-[11px] text-slate-400">Preferiblemente @soy.sena.edu.co, @sena.edu.co o @gmail.com</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-sena-600" /> Rol y Nivel de Privilegios{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                  >
                    <option value="ADMIN">ADMIN - Administrador de Contenidos & RAG</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Nivel de autorización institucional dentro del ecosistema Synapse.</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sena-600" /> Estado de la Cuenta{" "}
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-sena-500 focus:bg-white focus:ring-4 focus:ring-sena-500/15"
                  >
                    <option value="ACTIVE">ACTIVO - Habilitado para operar de inmediato</option>
                    <option value="INACTIVE">INACTIVO - En espera de validación de credenciales</option>
                  </select>
                  <p className="text-[11px] text-slate-400">Controla si el administrador puede autenticarse actualmente.</p>
                </div>
              </div>

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
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                            admin.role === "SUPER_ADMIN"
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
                      <td className="py-4 px-6 text-right text-xs font-semibold text-slate-500">SENA CTMA</td>
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
