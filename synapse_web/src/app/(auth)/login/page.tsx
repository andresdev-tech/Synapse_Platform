"use client"
import { signIn, useSession } from "next-auth/react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye } from "lucide-react"

function LoginForm() {
  const { data: session, status } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    try {
      const res = await signIn("credentials", { email: email.trim(), password, redirect: false })
      if (res?.error) {
        if (res.error === "unverified_email") {
          router.push(`/verify-email?email=${encodeURIComponent(email.trim())}`)
        } else {
          setError(res.error)
        }
      } else {
        window.location.href = "/"
      }
    } catch (err) {
      setError("Error al iniciar sesión")
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50">
      <div className="hidden lg:flex w-1/2 bg-slate-900 bg-[url('https://images.unsplash.com/photo-1497215728101-856f4ea42174?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80')] bg-cover bg-center relative items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"></div>
        <div className="relative z-10 p-12 text-white max-w-lg text-center">
          <h2 className="text-4xl font-extrabold mb-6">Bienvenido de nuevo</h2>
          <p className="text-lg text-slate-300 leading-relaxed">
            Accede a tus apuntes personales y mantente actualizado con las últimas noticias del SENA CTMA.
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
            <h2 className="text-3xl font-bold text-slate-800">Iniciar Sesión</h2>
            <p className="text-slate-500 mt-2">Ingresa tus credenciales para continuar</p>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100">{error}</div>}
          
          <div className="space-y-5">
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
            </div>
            
            <div className="flex items-center justify-end text-sm">
              <a href="/forgot-password" className="text-indigo-600 font-semibold hover:underline">¿Olvidaste tu contraseña?</a>
            </div>

            <button className="w-full bg-slate-900 text-white p-3 rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg transition-all mt-4">
              Entrar
            </button>
          </div>
          
          {/* SECCIÓN DE GOOGLE Y GITHUB COMENTADA HASTA QUE SE CONFIGUREN LOS TOKENS EN EL .ENV
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">O continúa con</span></div>
          </div>

          <div className="space-y-3">
            <button type="button" onClick={() => signIn("google")} className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 p-3 rounded-xl hover:bg-slate-50 transition-all font-medium">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              <span>Google</span>
            </button>
            <button type="button" onClick={() => signIn("github")} className="w-full flex items-center justify-center space-x-2 bg-[#24292F] text-white p-3 rounded-xl hover:bg-[#24292F]/90 transition-all font-medium">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
              <span>GitHub</span>
            </button>
          </div>
          */}
          
          <div className="mt-8 text-center text-sm text-slate-600">
            ¿No tienes cuenta? <a href="/register" className="text-indigo-600 font-semibold hover:underline">Regístrate ahora</a>
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
