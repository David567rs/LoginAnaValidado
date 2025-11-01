"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
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
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
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

  // Auto-verificación usando enlace mágico (?email=..&code=..)
  const triedRef = useRef(false)
  useEffect(() => {
    const codeQ = params.get('code')
    const emailQ = (params.get('email') || email || '').trim().toLowerCase()
    if (!triedRef.current && codeQ && emailQ) {
      triedRef.current = true
      setEmail(emailQ)
      setCode(codeQ)
      ;(async () => {
        setLoading(true)
        try {
          const res = await apiFetch<{ user: any; accessToken: string }>("/auth/verify-email", {
            method: "POST",
            body: JSON.stringify({ email: emailQ, code: codeQ.trim() }),
          })
          setToken(res.accessToken)
          toast.success("Correo verificado")
          router.push('/dashboard')
        } catch (err: any) {
          toast.error('No se pudo verificar: ' + (err?.message || 'Error'))
        } finally {
          setLoading(false)
        }
      })()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params])

  const handleResend = async () => {
    setLoading(true)
    try {
      await apiFetch('/auth/resend-verification', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase() }) })
      toast.success('Código reenviado')
      // Reinicia contador a 15:00 y guarda marca de tiempo
      const now = Date.now()
      localStorage.setItem(`verif_sent:${email.toLowerCase()}`, String(now))
      setStartTs(now)
    } catch (err: any) {
      toast.error('No se pudo reenviar: ' + (err?.message || 'Error'))
    } finally {
      setLoading(false)
    }
  }

  // Nota y contador de caducidad (15 minutos desde el último envío)
  const CODE_TTL_MS = 15 * 60 * 1000
  const [startTs, setStartTs] = useState<number>(() => {
    if (typeof window === 'undefined') return Date.now()
    const saved = localStorage.getItem(`verif_sent:${defaultEmail.toLowerCase()}`)
    return saved ? Number(saved) : Date.now()
  })
  const [now, setNow] = useState<number>(Date.now())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const remainingMs = Math.max(0, CODE_TTL_MS - (now - startTs))
  const isExpired = remainingMs <= 0
  const mm = String(Math.floor(remainingMs / 60000)).padStart(2, '0')
  const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')

  return (
    <Card className="border-border/50 shadow-xl backdrop-blur-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-3xl font-bold text-center">Verifica tu correo</CardTitle>
        <CardDescription className="text-center">
          Hemos enviado un código de 6 dígitos a tu correo. Usa siempre el último código enviado.
          <br />
          Caduca en: {mounted ? (
            <span className="font-medium">{mm}:{ss}</span>
          ) : (
            <span className="font-medium" suppressHydrationWarning>15:00</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Código</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              required
              disabled={isExpired || loading}
              aria-disabled={isExpired || loading}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={!mounted || loading || isExpired}
            aria-disabled={!mounted || loading || isExpired}
          >
            {isExpired ? 'Código expirado — Reenviar' : 'Verificar'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button variant="outline" onClick={handleResend} disabled={loading}>Reenviar código</Button>
        {isExpired && (
          <span className="text-sm text-destructive">El código ha expirado. Reenvía para obtener uno nuevo.</span>
        )}
      </CardFooter>
    </Card>
  )
}
