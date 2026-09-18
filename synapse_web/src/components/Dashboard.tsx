"use client"

import { useSession } from "next-auth/react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Suspense } from "react"
const ApprenticeDashboard = dynamic(() => import("./ApprenticeDashboard").then(mod => mod.ApprenticeDashboard), { 
  loading: () => <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando tu panel...</div> 
})
const LandingPage = dynamic(() => import("./LandingPage").then(mod => mod.LandingPage), { 
  loading: () => <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando inicio...</div> 
})

const AdminDashboard = dynamic(() => import("./AdminDashboard").then(mod => mod.AdminDashboard), { 
  loading: () => <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando Admin...</div> 
})
const SuperAdminDashboard = dynamic(() => import("./SuperAdminDashboard"), { 
  loading: () => <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando Super Admin...</div> 
})

function DashboardContent({ initialNotes, initialCategories }: { initialNotes?: any[], initialCategories?: any[] }) {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const isGuest = searchParams.get("guest") === "true"

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando tu espacio...</div>
  }

  if (session?.user?.role === "ADMIN") {
    return <AdminDashboard />
  }

  if (session?.user?.role === "SUPER_ADMIN") {
    return <SuperAdminDashboard />
  }

  return <ApprenticeDashboard initialNotes={initialNotes} initialCategories={initialCategories} />
}

export function Dashboard({ initialNotes, initialCategories }: { initialNotes?: any[], initialCategories?: any[] }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[50vh] text-slate-500">Cargando...</div>}>
      <DashboardContent initialNotes={initialNotes} initialCategories={initialCategories} />
    </Suspense>
  )
}
