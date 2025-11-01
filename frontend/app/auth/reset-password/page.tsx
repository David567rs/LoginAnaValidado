import Image from "next/image"
import styles from "@/styles/pages/login.module.css"
import { ResetPasswordForm } from "@/components/auth/reset-password-form"

export default function ResetPasswordPage({ searchParams }: { searchParams: { token?: string } }) {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left side - Reset Password Form */}
        <div className="flex-1 flex items-center justify-center p-10 md:p-12 bg-background">
          <div className="w-full max-w-lg animate-fade-in-up">
            <ResetPasswordForm tokenProp={searchParams?.token} />
          </div>
        </div>

        {/* Right side - Brand Visual */}
        <div className={`hidden lg:flex flex-1 bg-primary ${styles.hero}`}>
          <div className={styles.bgLeft} />
          <div className={styles.bgRight} />

          <div className="relative z-10 text-center animate-slide-in-right">
            <div className="mb-8 animate-float">
                                      <Image
                                        src="/LogoLetras.png"
                                        alt="INHALEX Logo"
                                        width={256}
                                        height={256}
                                        priority
                                        className="w-24 h-24 md:w-166 md:h-76 mx-auto drop-shadow-2xl"
                                      />
                                    </div>
            <h1 className="text-5xl md:text-6xl font-bold text-primary-foreground mb-5 text-balance tracking-tight">
              Crea tu nueva contraseña
            </h1>
            <p className="text-xl text-primary-foreground/90 max-w-xl mx-auto leading-relaxed">
              Define una contraseña segura para tu cuenta
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
