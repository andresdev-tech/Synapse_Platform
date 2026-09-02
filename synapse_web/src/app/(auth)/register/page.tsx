"use client"
import { fetchApi } from "@/lib/fetchApi";
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"
import { useSession } from "next-auth/react"
import ReCAPTCHA from "react-google-recaptcha"

export default function Register() {
  const { status } = useSession()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  
  const recaptchaRef = useRef<ReCAPTCHA>(null)
  const router = useRouter()

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    // Si tenemos clave pública real o de prueba configurada en el .env
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
    if (siteKey && siteKey !== "dummy" && !captchaToken) {
      setError("Por favor, verifica que no eres un robot")
      return
    }

    setLoading(true)
    try {
      const res = await fetchApi("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password, captchaToken })
      })
      if (res.ok) {
        // Redirigir a la página de verificación bonita
        router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
      } else {
        const data = await res.json()
        setError(data.error || "Error al registrarse")
        if (recaptchaRef.current) recaptchaRef.current.reset()
      }
    } catch (err) {
      setError("Error de conexión al servidor")
      if (recaptchaRef.current) recaptchaRef.current.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-indigo-900 bg-[url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center relative items-center justify-center">
        <div className="absolute inset-0 bg-indigo-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 p-12 text-white max-w-lg text-center">
          <h2 className="text-4xl font-extrabold mb-6">Únete a la comunidad CTMA</h2>
          <p className="text-lg text-indigo-100 leading-relaxed">
            Organiza tu aprendizaje, mantente al tanto de las noticias globales y lleva tus apuntes al siguiente nivel con Synapse.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
        <a href="/?guest=true" className="absolute top-8 left-8 flex items-center text-slate-500 hover:text-indigo-600 transition-colors font-bold text-sm bg-white p-2 pr-4 rounded-full shadow-sm border border-slate-100 group">
          <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center mr-2 transition-colors">
            <svg className="w-4 h-4 text-slate-600 group-hover:text-indigo-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </div>
          Volver al inicio
        </a>
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-10 rounded-2xl shadow-xl border border-slate-100 mt-12 md:mt-0">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-800">Crear una cuenta</h2>
            <p className="text-slate-500 mt-2">Ingresa tus datos para registrarte</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Completo</label>
              <input type="text" placeholder="Ej. Juan Pérez" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400" required onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
              <input type="email" placeholder="ej. tucorreo@gmail.com" className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400" required onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition text-slate-900 placeholder-slate-400 pr-12" 
                  required 
                  onChange={e => setPassword(e.target.value)} 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Mínimo 6 caracteres, 1 mayúscula, 2 números y 1 carácter especial.</p>
            </div>
          </div>
          
          {process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY !== "dummy" && (
            <div className="flex justify-center my-4">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={(token) => setCaptchaToken(token)}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white p-4 rounded-xl font-semibold hover:bg-slate-800 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {loading ? "Creando cuenta..." : "Crear cuenta."}
          </button>
          
          <div className="mt-8 text-center text-sm text-slate-600">
            ¿Ya tienes una cuenta? <a href="/login" className="text-indigo-600 font-semibold hover:underline">Inicia sesión aquí</a>
          </div>
        </form>
      </div>
    </div>
  )
}
