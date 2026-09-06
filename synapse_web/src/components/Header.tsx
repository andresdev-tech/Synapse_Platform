"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { LogOut, ArrowLeft } from "lucide-react"
import { usePathname, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { CtmaMenu } from "./CtmaMenu"

function HeaderActions() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isGuestMode = pathname === "/" && searchParams.get("guest") === "true"

  return (
    <>
      <div className="flex items-center space-x-6">
        <Link href="/" className="flex items-center group">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sena-400 to-sena-600 group-hover:from-sena-500 group-hover:to-sena-700 transition-all">
            Synapse
          </h1>
        </Link>

        {/* CTMA Blog Navigation Links */}
        <CtmaMenu />
        
        {(!session && isGuestMode) && (
          <Link href="/" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center bg-zinc-800/50 px-4 py-2 rounded-full border border-zinc-700/50 hover:border-slate-500 hover:shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {session && (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-zinc-300">
              {session.user?.name} ({session.user?.role})
            </span>
            <button
              onClick={() => signOut()}
              className="p-2 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full transition-colors flex items-center"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </>
  )
}

export const Header = () => {
  return (
    <header className="bg-zinc-900 text-white shadow-md sticky top-0 z-50">
      <div className="w-full mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center h-16">
          <Suspense fallback={
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sena-400 to-sena-600">
                Synapse
              </h1>
            </div>
          }>
            <HeaderActions />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
