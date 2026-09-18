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
      </div>

      <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
        {(!session && isGuestMode) && (
          <Link href="/" className="text-sm font-medium text-white hover:text-white transition-colors flex items-center bg-sena-500 px-4 py-2 rounded-full border border-sena-600 hover:bg-sena-600 hover:border-sena-600 hover:shadow-lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Link>
        )}
        
        {session && (
          <div className="flex min-w-0 items-center space-x-2 sm:space-x-4">
            <span className="max-w-[10rem] truncate text-right text-xs font-medium text-slate-600 dark:text-zinc-300 sm:max-w-none sm:text-sm">
              {session.user?.name} ({session.user?.role})
            </span>
            <button
              onClick={() => signOut()}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full transition-colors flex items-center"
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
    <header className="bg-white/70 dark:bg-zinc-950/70 text-slate-900 dark:text-white backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 shadow-sm sticky top-0 z-50 transition-colors duration-300">
      <div className="mx-auto w-full px-3 sm:px-4 md:px-8">
        <div className="flex min-h-16 items-center justify-between gap-3 py-2 sm:py-0">
          <Suspense fallback={
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-500">
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
