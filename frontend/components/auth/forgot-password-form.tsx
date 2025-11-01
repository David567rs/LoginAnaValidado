"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sent, setSent] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSending(true)
    try {
      const res = await apiFetch<{ ok: boolean; devToken?: string; resetUrl?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
      setSent(true)
      toast.success("Si el correo existe, se envió un enlace")
      if (res.devToken) {
        // para desarrollo: redirigimos directo
        router.push(`/auth/reset-password?token=${res.devToken}`)
      }
    } catch (err: any) {
      toast.error("No se pudo enviar el enlace: " + (err?.message || "Error desconocido"))
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-balance">Recuperar contraseña</CardTitle>
          <CardDescription className="text-center text-base">
            Te enviaremos un enlace para restablecerla
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm text-muted-foreground max-w-sm">
                Si {email} está registrado, recibirás un correo con instrucciones para restablecer tu contraseña.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSending} aria-live="polite">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Correo electrónico
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="pl-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300"
                disabled={isSending}
                aria-disabled={isSending}
              >
                {isSending ? "Enviando enlace..." : (
                  <span className="inline-flex items-center gap-2">Enviar enlace <ArrowRight className="h-5 w-5" /></span>
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-primary hover:text-primary/80 font-medium">
            Volver a iniciar sesión
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
