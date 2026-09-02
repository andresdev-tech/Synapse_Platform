"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import { AdminDashboard } from "./AdminDashboard"
import { ApprenticeDashboard } from "./ApprenticeDashboard"
import { LandingPage } from "./LandingPage"
import { Suspense } from "react"

function DashboardContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("guest") === "true"

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando tu espacio...</div>
  }

  if (session?.user?.role === "ADMIN") {
    return <AdminDashboard />
  }

  if (!session && !isGuest) {
    return <LandingPage />
  }

  return <ApprenticeDashboard />
}

export function Dashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando...</div>}>
      <DashboardContent />
    </Suspense>
  )
}
