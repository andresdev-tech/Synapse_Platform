"use client"

import { fetchApi } from "@/lib/fetchApi"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyRound, Clock, RotateCw, CheckCircle2 } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"

function LoginForm() {
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
      router.push("/")
    }
    if (searchParams.get("verified") === "true") {
      setSuccessMsg("¡Correo verificado con éxito! Ahora puedes iniciar sesión.")
    }
  }, [status, router, searchParams])

  // Temporizador de cuenta regresiva de 10 minutos cuando se envía el OTP
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
        body: JSON.stringify({ email: email.trim(), captchaToken }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "No se pudo enviar el código")
      
      setOtpSent(true)
      setOtp("")
      setTimeLeft(600) // Reiniciar a 10 minutos
      setSuccessMsg(`Te enviamos un código de 6 dígitos a ${email.trim()}. Vence en 10 minutos.`)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No se pudo enviar el código")
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
        redirect: false,
      })

      if (res?.error) {
        setError(res.error)
      } else {
        router.push("/")
      }
    } catch {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-slate-900 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center relative items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 p-12 text-white max-w-lg text-center">
          <h2 className="text-4xl font-extrabold mb-6">Bienvenido de nuevo</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Accede a tus apuntes personales y mantente actualizado con las últimas noticias del SENA CTMA.
          </p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center px-4 py-16 sm:p-8 lg:w-1/2">
        <a href="/?guest=true" className="absolute left-4 top-4 flex items-center text-xs font-bold text-slate-500 transition-colors hover:text-indigo-600 sm:left-8 sm:top-8 sm:text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center mr-2 transition-colors">
            <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </div>
          Volver al inicio
        </a>
        <form onSubmit={handleSubmit} className="mt-8 w-full max-w-md rounded-2xl border border-slate-100 bg-white p-5 shadow-xl sm:mt-0 sm:p-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Acceder a Synapse</h2>
            <p className="text-slate-500 mt-2 text-sm">Ingresa tu correo y recibe un código de acceso.</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
          {successMsg && (
            <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm mb-6 border border-emerald-100 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="ej. tucorreo@gmail.com" 
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
                  <label className="block text-sm font-medium text-slate-700">Código de 6 dígitos</label>
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
                    className="w-full rounded-xl border border-slate-300 p-3 pl-11 text-center text-xl font-bold tracking-[0.35em] text-slate-900 outline-none focus:border-sena-500 focus:ring-2 focus:ring-sena-500 disabled:bg-slate-100 disabled:text-slate-400" 
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
              <div className="flex justify-center overflow-hidden">
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
              className="w-full bg-slate-900 text-white p-3 rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all mt-4 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading 
                ? "Procesando..." 
                : otpSent 
                ? (timeLeft === 0 ? "Código expirado" : "Verificar código") 
                : "Enviar código"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  )
}
