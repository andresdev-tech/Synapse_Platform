"use client"
import { fetchApi } from "@/lib/fetchApi";
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Eye, CheckCircle2 } from "lucide-react"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Email, 2: Code+Password, 3: Success
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("Enviando...")
    try {
      const res = await fetchApi("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      })
      if (res.ok) {
        setMessage("")
        setStep(2)
      } else {
        setError("Error al procesar la solicitud")
        setMessage("")
      }
    } catch {
      setError("Error de red")
      setMessage("")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const res = await fetchApi("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: code.trim(), newPassword })
      })
      if (res.ok) {
        setStep(3)
      } else {
        const data = await res.json()
        setError(data.error || "Código inválido o error al cambiar la contraseña")
      }
    } catch {
      setError("Error de conexión al servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-slate-900 bg-[url('https://images.unsplash.com/photo-1555421689-491a97ff2040?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center relative items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 p-12 text-white max-w-lg text-center">
          <h2 className="text-4xl font-extrabold mb-6">Recupera tu acceso</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Te ayudaremos a recuperar tu cuenta de forma segura enviando un código a tu bandeja de entrada.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100">
          
          {step === 1 && (
            <form onSubmit={handleRequestCode}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Recuperar Contraseña</h2>
                <p className="text-slate-500 mt-2">Ingresa tu correo para recibir las instrucciones</p>
              </div>
              
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
              {message && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm mb-6 border border-emerald-100">{message}</div>}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                  <input type="email" placeholder="ej. tucorreo@gmail.com" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400" required value={email} onChange={e => setEmail(e.target.value)} disabled={loading} />
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all mt-4 disabled:opacity-70">
                  {loading ? "Procesando..." : "Enviar instrucciones"}
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Código de Seguridad</h2>
                <p className="text-slate-500 mt-2">Hemos enviado un código de 6 dígitos a <b>{email}</b></p>
              </div>
              
              {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
              
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Código de verificación</label>
                  <input type="text" placeholder="123456" maxLength={6} className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400 tracking-widest text-center font-bold text-xl" required value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))} disabled={loading} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      placeholder="•••••••••" 
                      className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400 pr-12" 
                      required 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)} 
                      disabled={loading}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-2">Mínimo 6 caracteres, 1 mayúscula, 2 números y 1 carácter especial.</p>
                </div>
                
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all mt-4 disabled:opacity-70">
                  {loading ? "Cambiando..." : "Cambiar Contraseña"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">¡Contraseña Cambiada!</h2>
              <p className="text-slate-500 mb-8">Tu contraseña ha sido actualizada con éxito.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-emerald-500 text-white p-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">
                Ir a Iniciar Sesión
              </button>
            </div>
          )}
          
          {step !== 3 && (
            <div className="mt-8 text-center text-sm text-slate-600">
              <a href="/login" className="text-indigo-600 font-semibold hover:underline">← Volver al login</a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
