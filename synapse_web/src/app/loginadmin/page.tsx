"use client"

import { fetchApi } from "@/lib/fetchApi"
import { signIn, signOut, useSession } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyRound, ShieldCheck, ShieldAlert, ArrowLeft, CheckCircle2, Lock, LogOut, Clock, RotateCw } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"

function AdminLoginForm() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutos en segundos
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (status === "authenticated") {
      const role = session?.user?.role
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        router.push("/")
      }
    }
    if (searchParams.get("verified") === "true") {
      setSuccessMsg("¡Correo verificado con éxito! Ahora puedes iniciar sesión.")
    }
  }, [status, session, router, searchParams])

  // Temporizador de cuenta regresiva de 10 minutos
  useEffect(() => {
    if (!otpSent) return
    if (timeLeft <= 0) return

    const interval = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [otpSent, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleRequestOtp = async () => {
    setLoading(true)
    setError("")
    setSuccessMsg("")
    try {
      const response = await fetchApi("/api/auth/otp/request", {
        method: "POST",
        body: JSON.stringify({ 
          email: email.trim(), 
          captchaToken,
          adminOnly: true 
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || "No se pudo enviar el código de verificación")
      }

      setOtpSent(true)
      setOtp("")
      setTimeLeft(600) // Reiniciar a 10 minutos
      setSuccessMsg(`Te enviamos un código de 6 dígitos a ${email.trim()}. Vence en 10 minutos.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo procesar la solicitud")
      setCaptchaToken(null)
    } finally {
      setLoading(false)
    }
  }

  const handleChangeEmail = () => {
    setOtpSent(false)
    setOtp("")
    setTimeLeft(600)
    setError("")
    setSuccessMsg("")
  }

  const captchaConfigured = Boolean(
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && 
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY !== "dummy"
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")

    try {
      if (!otpSent) {
        await handleRequestOtp()
        return
      }

      if (timeLeft === 0) {
        setError("El código ha expirado. Por favor, solicita uno nuevo.")
        return
      }

      setLoading(true)
      const res = await signIn("credentials", {
        email: email.trim(),
        otpCode: otp.trim(),
        adminOnly: "true",
        redirect: false,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/")
      }
    } catch {
      setError("Error al iniciar sesión administrativa")
    } finally {
      setLoading(false)
    }
  }

  const isCurrentNormalUser = status === "authenticated" && 
    session?.user?.role !== "ADMIN" && 
    session?.user?.role !== "SUPER_ADMIN"

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      {/* Columna Izquierda: Banner visual administrativo idéntico en estructura */}
      <div className="hidden lg:flex w-1/2 bg-slate-950 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center relative items-center justify-center">
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"></div>
        <div className="relative z-10 p-12 text-white max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Portal de Administración · SENA CTMA</span>
          </div>

          <h2 className="text-4xl font-extrabold mb-6 tracking-tight">
            Panel de Control Central
          </h2>
          <p className="text-lg text-slate-300 leading-relaxed mb-8">
            Espacio de autenticación restringido para Administradores y Super Administradores de la plataforma Synapse.
          </p>

          <div className="space-y-3.5 border-t border-slate-800/80 pt-6 text-sm text-slate-300">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Gestión global de notas, anuncios y categorías</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Control y supervisión de la base de conocimiento RAG</span>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Autenticación protegida con verificación de privilegios</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha: Formulario de inicio de sesión administrativo */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-16 sm:p-8 lg:w-1/2">
        <a 
          href="/?guest=true" 
          className="absolute left-4 top-4 flex items-center text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600 sm:left-8 sm:top-8 sm:text-sm"
        >
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center mr-2 transition-colors">
            <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          </div>
          Volver al inicio
        </a>

        <div className="mt-8 w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl sm:mt-0 sm:p-10">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-indigo-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/10">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800">Acceso Administrativo</h2>
            <p className="text-slate-500 mt-2 text-sm">
              Exclusivo para cuentas con rol de <strong>Admin</strong> y <strong>Super Admin</strong>.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 border border-amber-200">
              <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
              <span>Acceso restringido por credenciales</span>
            </div>
          </div>

          {/* Advertencia si ya está logueado como usuario común */}
          {isCurrentNormalUser && (
            <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl text-xs space-y-2 mb-6">
              <p className="font-semibold flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                Sesión estándar activa:
              </p>
              <p>
                Tienes una sesión como usuario convencional ({session?.user?.email}). Para entrar como administrador, ingresa con tu correo autorizado o cierra tu sesión actual.
              </p>
              <button
                type="button"
                onClick={() => signOut({ redirect: false })}
                className="mt-1 inline-flex items-center gap-1 text-amber-800 font-bold hover:underline"
              >
                <LogOut className="w-3.5 h-3.5" /> Cerrar sesión actual
              </button>
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm mb-6 border border-emerald-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo Institucional Autorizado
              </label>
              <input
                type="email"
                placeholder="ej. admin@soy.sena.edu.co"
                value={email}
                disabled={otpSent || loading}
                className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400 disabled:bg-slate-100 disabled:text-slate-500"
                required
                onChange={e => setEmail(e.target.value)}
              />
              {otpSent && (
                <div className="mt-2 flex items-center justify-between text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-600 truncate mr-2">
                    Enviado a: <strong className="text-slate-800">{email}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleChangeEmail}
                    className="text-indigo-600 font-semibold hover:underline shrink-0"
                  >
                    Cambiar correo
                  </button>
                </div>
              )}
            </div>

            {otpSent && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-slate-700">
                    Código de 6 dígitos
                  </label>
                  <div className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-md ${
                    timeLeft > 60 
                      ? "bg-slate-100 text-slate-700" 
                      : timeLeft > 0 
                      ? "bg-amber-100 text-amber-800 animate-pulse" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    <Clock className="w-3 h-3" />
                    <span>{timeLeft > 0 ? formatTime(timeLeft) : "Expirado"}</span>
                  </div>
                </div>

                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    disabled={timeLeft === 0}
                    className="w-full rounded-xl border border-slate-300 p-3 pl-11 text-center text-xl font-bold tracking-[0.35em] text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100 disabled:text-slate-400"
                    required
                  />
                </div>

                {timeLeft === 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    El código ha caducado. Vuelve a solicitar un código nuevo.
                  </p>
                )}

                <div className="flex items-center justify-between text-xs pt-2">
                  <span className="text-slate-500">¿No recibiste el código?</span>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={loading}
                    className="text-indigo-600 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    <RotateCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
                    Reenviar código
                  </button>
                </div>
              </div>
            )}

            {captchaConfigured && !otpSent && (
              <div className="flex justify-center overflow-hidden my-2">
                <ReCAPTCHA
                  sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY as string}
                  onChange={setCaptchaToken}
                  onExpired={() => setCaptchaToken(null)}
                  onErrored={() => setCaptchaToken(null)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (!otpSent && captchaConfigured && !captchaToken) || (otpSent && timeLeft === 0)}
              className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all mt-4 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>Procesando acceso...</span>
              ) : otpSent ? (
                timeLeft === 0 ? (
                  <span>Código expirado</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Verificar código y entrar</span>
                  </>
                )
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-indigo-400" />
                  <span>Enviar código de acceso</span>
                </>
              )}
            </button>
          </form>

          {/* Enlace al login convencional */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
            ¿Eres aprendiz o usuario estándar?{" "}
            <a href="/login" className="font-semibold text-indigo-600 hover:underline">
              Ir al login general
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">Cargando portal administrativo...</div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
