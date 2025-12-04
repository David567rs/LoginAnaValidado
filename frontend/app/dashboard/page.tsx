"use client"

import { useAuth } from "@/components/auth/auth-provider"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { getToken } from "@/lib/api"
import Image from "next/image"

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
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2 items-center">
          <div className="space-y-5">
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-700">Panel</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight text-emerald-900">
              Bienvenido{user ? `, ${user.name}` : ""} <span className="block text-emerald-700">a tu espacio de bienestar</span>
            </h1>
            <p className="text-lg text-emerald-800/80">
              Aquí verás tu información principal y próximas acciones. Usa el menú o los botones para continuar.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                className="bg-emerald-700 hover:bg-emerald-800"
                onClick={() => toast.success("Pronto agregaremos más secciones.")}
              >
                Próximamente
              </Button>
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

          <div className="relative w-full h-full">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl ring-1 ring-emerald-900/10">
              <Image
                src="/escaneo.jpg"
                alt="Visual de bienestar"
                width={1200}
                height={800}
                className="w-full h-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-sm uppercase tracking-wide text-white/80">Bienestar respiratorio</p>
                <p className="text-xl font-semibold">Tu siguiente sesión está lista cuando tú lo estés.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
