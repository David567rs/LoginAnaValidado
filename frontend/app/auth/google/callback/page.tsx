"use client"

"use client"

export const dynamic = "force-dynamic"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { setToken } from "@/lib/api"
import { toast } from "sonner"

export default function GoogleCallbackPage() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const token = params.get("token")
    if (token) {
      setToken(token, true)
      toast.success("Inicio de sesión con Google exitoso")
      router.replace("/dashboard")
    } else {
      toast.error("No se recibió token de Google")
      router.replace("/")
    }
  }, [params, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground">Procesando inicio de sesión...</p>
    </div>
  )
}
