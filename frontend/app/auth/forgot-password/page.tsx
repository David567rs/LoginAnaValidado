import Image from "next/image"
import styles from "@/styles/pages/login.module.css"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left side - Forgot Password Form */}
        <div className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6 md:px-10 lg:p-12 bg-background">
          <div className="w-full max-w-md sm:max-w-lg animate-fade-in-up">
            <ForgotPasswordForm />
          </div>
        </div>

        {/* Right side - Brand Visual */}
        <div className={`hidden xl:flex flex-1 bg-primary ${styles.hero}`}>
          <div className={styles.bgLeft} />
          <div className={styles.bgRight} />

          <div className="relative z-10 text-center animate-slide-in-right px-6">
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
              Recupera tu acceso
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Te enviaremos un enlace a tu correo
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
