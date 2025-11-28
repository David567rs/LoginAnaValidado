"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getToken } from "@/lib/api"

export default function DashboardPage() {
  const { user, refreshMe, logout, token } = useAuth()
  const router = useRouter()

  useEffect(() => {
    refreshMe().catch(() => {})
  }, [refreshMe])

  useEffect(() => {
    const t = typeof window !== 'undefined' ? getToken() : null
    if (!t && !token) router.replace('/')
  }, [router, token])

  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Bienvenido{user ? `, ${user.name}` : ''}</h1>
        <p className="text-muted-foreground">Este sera tu panel principal.</p>
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            onClick={() => {
              logout()
              toast.success('Sesion cerrada')
              router.push('/')
            }}
          >
            Cerrar sesion
          </Button>
        </div>
      </div>
    </main>
  )
}
