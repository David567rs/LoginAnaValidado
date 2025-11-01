"use client"

import type React from "react"
import Link from "next/link"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { apiFetch } from "@/lib/api"

export function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const { register: registerUser } = useAuth()
  const router = useRouter()
  const [passwordMatch, setPasswordMatch] = useState(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Comparar contraseñas en tiempo real
    if (name === "confirmPassword" || name === "password") {
      if (name === "confirmPassword") {
        setPasswordMatch(value === formData.password || value === "")
      } else {
        setPasswordMatch(formData.confirmPassword === value || formData.confirmPassword === "")
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      setPasswordMatch(false)
      return
    }

    setIsLoading(true)
    try {
      // New flow: backend requires email verification before login
      await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
      })
      toast.success('Registro exitoso. Revisa tu correo para el código')
      router.push(`/auth/verify-email/sent?email=${encodeURIComponent(formData.email)}`)
    } catch (err: any) {
      let msg = err?.message || String(err)
      try {
        const parsed = JSON.parse(msg)
        msg = parsed?.message || msg
      } catch {}
      console.error('Register error', msg)

      if (msg.includes('Email already in use')) {
        // Si el correo ya existe, reenviamos verificación y guiamos al usuario
        try {
          await apiFetch('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email: formData.email }),
          })
        } catch {}
        toast.info('El correo ya está en uso. Si no has verificado, te reenviamos el código.')
        router.push(`/auth/verify-email/sent?email=${encodeURIComponent(formData.email)}`)
        return
      }

      toast.error('No se pudo crear la cuenta: ' + msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-balance">Crear cuenta</CardTitle>
          <CardDescription className="text-center text-base">Completa tus datos para registrarte</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={isLoading} aria-live="polite">
            {/* Nombre completo */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre completo
              </Label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Tu nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Correo */}
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
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium">
                Número telefónico
              </Label>
              <div className="relative group">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+52 000 000 0000"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                  className="pl-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  className="pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirmar contraseña
              </Label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  aria-invalid={!passwordMatch && !!formData.confirmPassword}
                  aria-describedby={!passwordMatch && formData.confirmPassword ? "confirm-help" : undefined}
                  className={`pl-10 pr-10 h-11 transition-all duration-200 focus:ring-2 ${
                    !passwordMatch ? "border-red-500 focus:ring-red-500/20" : "focus:ring-primary/20"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {formData.confirmPassword && passwordMatch && (
                  <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                )}
              </div>
              {!passwordMatch && formData.confirmPassword && (
                <p id="confirm-help" className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-base font-semibold bg-primary hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group mt-6"
              disabled={isLoading || !passwordMatch}
              aria-disabled={isLoading || !passwordMatch}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creando cuenta...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Crear cuenta
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
            <div className="relative w-full">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">O regístrate con</span>
            </div>
          </div>

          <div className="flex w-full justify-center">
            <Button
              variant="outline"
              type="button"
              className="h-11 transition-all duration-200 hover:bg-accent hover:scale-[1.02] bg-transparent w-full max-w-xs"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/" className="text-primary hover:text-primary/80 font-medium transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </CardFooter>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros{" "}
        <a href="#" className="text-primary hover:underline">
          Términos de Servicio
        </a>{" "}
        y{" "}
        <a href="#" className="text-primary hover:underline">
          Política de Privacidad
        </a>
      </p>
    </div>
  )
}
