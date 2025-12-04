import { LoginForm } from "@/components/auth/login-form"
import { Footer } from "@/components/layout/footer"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left side - Login Form */}
        <div className="flex-1 flex items-center justify-center p-10 md:p-12 bg-background">
          <div className="w-full max-w-lg animate-fade-in-up">
            <LoginForm />
          </div>
        </div>

        {/* Right side - Brand Visual */}
        <div className="hidden lg:flex flex-1 bg-primary relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(141,191,90,0.15),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(105,191,151,0.15),transparent_50%)]" />

          <div className="relative z-10 text-center animate-slide-in-right">
            <div className="mb-8 animate-float">
              <Image
                src="/LogoLetras.png"
                alt="INHALEX Logo"
                width={256}
                height={256}
                priority
                className="w-24 h-24 md:w-160 md:h-80 mx-auto drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-5 text-balance tracking-tight">
              Bienvenido a tu plataforma de bienestar respiratorio
            </h1>
            
          </div>

          {/* Decorative elements */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </div>
      </div>

      <Footer />
    </div>
  )
}
