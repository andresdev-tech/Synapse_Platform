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
      <div className="flex min-w-0 items-center gap-3 sm:gap-6">
        <Link href="/" className="flex items-center group">
          <h1 className="bg-clip-text text-transparent bg-linear-to-r from-sena-400 to-sena-600 text-xl font-bold transition-all group-hover:from-sena-500 group-hover:to-sena-700 sm:text-2xl">
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

      <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
        {session && (
          <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
            <span className="max-w-[10rem] truncate text-right text-xs font-medium text-zinc-300 sm:max-w-none sm:text-sm">
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
      <div className="mx-auto w-full px-3 sm:px-4 md:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2 sm:py-0">
          <Suspense fallback={
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-sena-400 to-sena-600">
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
