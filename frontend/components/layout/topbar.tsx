"use client"

import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export default function Topbar() {
  const { user, logout } = useAuth()
  const firstName = user?.name ? user.name.split(" ")[0] : null

  return (
    <header className="w-full border-b border-border/50 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">INHALEX</Link>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Hola, <span className="font-medium text-foreground">{firstName}</span></span>
            <Button size="sm" variant="outline" onClick={logout}>Cerrar sesión</Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">Bienvenido</div>
        )}
      </div>
    </header>
  )
}

