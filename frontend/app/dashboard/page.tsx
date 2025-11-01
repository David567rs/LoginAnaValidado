"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function DashboardPage() {
  const { user, refreshMe, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    refreshMe().catch(() => {})
  }, [refreshMe])

  useEffect(() => {
    // Simple guard: if not logged in after refresh, redirect to home
    const t = typeof window !== 'undefined' ? localStorage.getItem('inhalex_token') : null
    if (!t) router.replace('/')
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Bienvenido{user ? `, ${user.name}` : ''}</h1>
        <p className="text-muted-foreground">Este será tu panel principal.</p>
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            onClick={() => {
              logout()
              toast.success('Sesión cerrada')
              router.push('/')
            }}
          >
            Cerrar sesión
          </Button>
        </div>
      </div>
    </main>
  )
}
