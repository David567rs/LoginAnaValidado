"use client"

import { Facebook, Instagram, Music2 } from "lucide-react"
import Image from "next/image"
import styles from "@/styles/components/footer.module.css"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"

export function Footer() {
  const { user, logout } = useAuth()
  return (
    <footer className="w-full bg-muted/30 border-t border-border/50">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-2">
          {/* Logo Section */}
          <div className="flex flex-col items-center md:items-start">
            <Image src="/inhalex-logo.png" alt="INHALEX" width={240} height={80} className={`${styles.logo} w-auto mb-4`} />
            <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
              El respiro que alivia. Tu plataforma de bienestar respiratorio.
            </p>
          </div>

          {/* Help Links */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Ayuda</h3>
            <ul className="space-y-2 text-center md:text-left">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Preguntas Frecuentes
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Soporte Técnico
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Guía de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Contacto
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                  Centro de Ayuda
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media & Payment Methods */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Síguenos</h3>
            <div className="flex gap-4 mb-6">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="TikTok"
              >
                <Music2 className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
              </a>
            </div>

            <h3 className="font-semibold text-lg mb-4 text-foreground">Métodos de pago</h3>
            <div className="flex gap-3 flex-wrap justify-center md:justify-start">
              <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center text-xs font-semibold text-muted-foreground hover:border-primary transition-colors">
                VISA
              </div>
              <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center text-xs font-semibold text-muted-foreground hover:border-primary transition-colors">
                MC
              </div>
              <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center text-xs font-semibold text-muted-foreground hover:border-primary transition-colors">
                AMEX
              </div>
              <div className="w-12 h-8 bg-card border border-border rounded flex items-center justify-center text-xs font-semibold text-muted-foreground hover:border-primary transition-colors">
                PP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border/50 bg-muted/50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors duration-200">
              Avisos de privacidad
            </a>
            <a href="#" className="hover:text-primary transition-colors duration-200">
              Términos y condiciones
            </a>
            <div className="flex items-center gap-4">
              {user ? (
                <Button size="sm" variant="outline" onClick={logout} className="h-8">
                  Cerrar sesión
                </Button>
              ) : null}
              <p className="text-center">2025 © INHALEX. Todos los derechos reservados</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
