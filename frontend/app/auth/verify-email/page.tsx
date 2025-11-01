import Image from "next/image"
import styles from "@/styles/pages/login.module.css"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center p-10 md:p-12 bg-background">
          <div className="w-full max-w-lg animate-fade-in-up">
            <VerifyEmailForm />
          </div>
        </div>
        <div className={`hidden lg:flex flex-1 bg-primary ${styles.hero}`}>
          <div className={styles.bgLeft} />
          <div className={styles.bgRight} />
          <div className="relative z-10 text-center animate-slide-in-right">
            <div className="mb-8 animate-float">
              <Image src="/LogoLetras.png" alt="INHALEX Logo" width={256} height={256} priority className={`${styles.heroLogo} mx-auto`} />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-5 tracking-tight">Confirma tu correo</h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">Ingresa el código que enviamos a tu bandeja</p>
          </div>
        </div>
      </div>
    </div>
  )
}

