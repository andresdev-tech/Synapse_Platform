"use client"
import { fetchApi } from "@/lib/fetchApi";
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"

function VerifyEmailForm() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  if (!email) {
    return (
      <div className="text-center">
        <p className="text-slate-600 mb-4">No se encontró un correo para verificar.</p>
        <button onClick={() => router.push("/register")} className="text-indigo-600 font-semibold hover:underline">Volver al registro</button>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetchApi("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() })
      })

      if (res.ok) {
        router.push("/login?verified=true")
      } else {
        const data = await res.json()
        setError(data.error || "Código incorrecto")
      }
    } catch (err) {
      setError("Error de red. Inténtalo de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Revisa tu correo</h2>
        <p className="text-slate-500 text-sm">
          Hemos enviado un código de 6 dígitos a <br/>
          <span className="font-semibold text-slate-800">{email}</span>
        </p>
      </div>
      
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-100 font-medium">{error}</div>}
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Código de Verificación</label>
          <input 
            type="text" 
            placeholder="Ej. 123456" 
            maxLength={6}
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-slate-900 text-center text-2xl tracking-widest font-bold" 
            required 
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))} 
          />
        </div>
        
        <button 
          disabled={loading || code.length < 6}
          className="w-full bg-slate-900 text-white p-4 rounded-xl font-semibold hover:bg-slate-800 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verificando..." : "Confirmar mi cuenta"}
        </button>
      </div>
      
      <div className="mt-8 text-center text-sm text-slate-500">
        ¿No recibiste el código?{" "}
        <button type="button" className="text-indigo-600 font-semibold hover:underline">Reenviar</button>
      </div>
    </form>
  )
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex bg-slate-50 items-center justify-center p-4">
      <Suspense fallback={<div className="text-slate-500">Cargando...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  )
}
