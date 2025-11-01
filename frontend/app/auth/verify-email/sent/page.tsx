"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { apiFetch } from "@/lib/api"
import { toast } from "sonner"

export default function VerifyEmailSentPage() {
  const params = useSearchParams()
  const email = params.get('email') || ''
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const resend = async () => {
    setLoading(true)
    try {
      await apiFetch('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email }) })
      toast.success('Código reenviado')
    } catch (err: any) {
      toast.error('No se pudo reenviar: ' + (err?.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-10">
      <div className="max-w-lg w-full text-center space-y-4">
        <h1 className="text-3xl font-bold">Revisa tu correo</h1>
        <p className="text-muted-foreground">Enviamos un código de verificación a <span className="font-medium">{email}</span>. También puedes usar el enlace directo dentro del correo.</p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={() => router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`)} variant="outline">Ingresar código manualmente</Button>
          <Button onClick={resend} disabled={loading} aria-disabled={loading}>Reenviar código</Button>
        </div>
      </div>
    </main>
  )
}

