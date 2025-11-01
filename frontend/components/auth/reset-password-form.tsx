"use client"

import type React from "react"
import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react"
import { apiFetch } from "@/lib/api"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function ResetPasswordForm({ tokenProp }: { tokenProp?: string }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [token, setToken] = useState(tokenProp || "")
  const router = useRouter()

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (mismatch) return
    setIsSubmitting(true)
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword: password }),
      })
      setDone(true)
      toast.success("Contraseña actualizada. Inicia sesión")
    } catch (err: any) {
      toast.error("No se pudo actualizar: " + (err?.message || "Error desconocido"))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-balance">Restablecer contraseña</CardTitle>
          <CardDescription className="text-center text-base">
            Ingresa tu nueva contraseña
          </CardDescription>
        </CardHeader>
        <CardContent>
          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
              <p className="text-sm text-muted-foreground">Tu contraseña fue restablecida correctamente.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={isSubmitting} aria-live="polite">
              <div className="space-y-2">
                <Label htmlFor="token" className="text-sm font-medium">Token</Label>
                <Input id="token" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Pega el token o usa el del enlace" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Nueva contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="password"
                    name="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="pl-10 pr-10 h-12 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    required
                  />
                  <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm font-medium">Confirmar contraseña</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                  <Input
                    id="confirm"
                    name="confirm-password"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={mismatch}
                    aria-describedby={mismatch ? "reset-help" : undefined}
                    className={`pl-10 pr-10 h-12 transition-all duration-200 focus:ring-2 ${mismatch ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"}`}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {mismatch && (
                  <p id="reset-help" className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300" disabled={isSubmitting || mismatch} aria-disabled={isSubmitting || mismatch}>
                {isSubmitting ? "Guardando..." : "Restablecer contraseña"}
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
