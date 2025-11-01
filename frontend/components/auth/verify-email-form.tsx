"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { apiFetch, setToken } from "@/lib/api"
import { useAuth } from "@/components/auth/auth-provider"
import { toast } from "sonner"

export function VerifyEmailForm() {
  const params = useSearchParams()
  const defaultEmail = params.get('email') || ''
  const [email, setEmail] = useState(defaultEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  // We will consume AuthProvider indirectly via apiFetch + storing token

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await apiFetch<{ user: any; accessToken: string }>("/auth/verify-email", {
        method: "POST",
        body: JSON.stringify({ email, code }),
      })
      setToken(res.accessToken)
      toast.success("Correo verificado")
      router.push('/dashboard')
    } catch (err: any) {
      toast.error('No se pudo verificar: ' + (err?.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  // Auto-verify if code is present in query
  const codeFromLink = params.get('code')
  const hasAutoTried = useState(false)[0]
  if (codeFromLink && !hasAutoTried && code.length === 0) {
    setCode(codeFromLink)
    // microtask to submit without blocking render
    Promise.resolve().then(() => {
      const fakeEvent = { preventDefault() {} } as unknown as React.FormEvent
      handleVerify(fakeEvent)
    })
  }

  const handleResend = async () => {
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
    <Card className="border-border/50 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-center">Verifica tu correo</CardTitle>
        <CardDescription className="text-center">Hemos enviado un código de 6 dígitos a tu correo</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading} aria-disabled={loading}>Verificar</Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleResend} disabled={loading}>Reenviar código</Button>
      </CardFooter>
    </Card>
  )
}
