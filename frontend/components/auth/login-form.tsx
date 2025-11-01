"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await login(email, password)
      toast.success("Bienvenido de nuevo")
      router.push("/dashboard")
    } catch (err: any) {
      let msg: string = typeof err?.message === "string" ? err.message : String(err)
      try {
        const parsed = JSON.parse(msg)
        if (parsed?.message) msg = parsed.message
      } catch {}
      if (msg.toLowerCase().includes("email not verified")) {
        try {
          await apiFetch("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) })
        } catch {}
        toast.info("Tu correo no está verificado. Te reenviamos el código.")
        router.push(`/auth/verify-email/sent?email=${encodeURIComponent(email)}`)
        setIsLoading(false)
        return
      }
      toast.error("No se pudo iniciar sesión: " + msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-balance">Iniciar Sesión</CardTitle>
          <CardDescription className="text-center text-base">Ingresa tus credenciales para acceder</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Correo electrónico</Label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input id="email" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 h-12" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary" />
                <span className="text-muted-foreground">Recordarme</span>
              </label>
              <Link href="/auth/forgot-password" className="text-primary hover:text-primary/80 font-medium">¿Olvidaste tu contraseña?</Link>
            </div>
            <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Iniciando sesión..." : (
                <span className="inline-flex items-center gap-2">Iniciar Sesión <ArrowRight className="h-5 w-5" /></span>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta? {" "}
            <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium">Regístrate aquí</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

