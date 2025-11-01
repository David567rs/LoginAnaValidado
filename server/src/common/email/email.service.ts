import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import sgMail from '@sendgrid/mail'

@Injectable()
export class EmailService {
  private readonly enabled: boolean
  private readonly from: string

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('SENDGRID_API_KEY')
    this.from = config.get<string>('SENDGRID_FROM') || 'no-reply@example.com'
    if (apiKey) {
      sgMail.setApiKey(apiKey)
      this.enabled = true
    } else {
      this.enabled = false
      // eslint-disable-next-line no-console
      console.log('[EmailService] SENDGRID_API_KEY no configurado. Modo desarrollo.')
    }
  }

  async sendPasswordReset(to: string, link: string) {
    if (!this.enabled) {
      console.log(`[EmailService:dev] Reset link for ${to}: ${link}`)
      return
    }
    try {
      await sgMail.send({
        to,
        from: this.from,
        subject: 'Restablece tu contraseña',
        html: `
          <p>Solicitaste restablecer tu contraseña.</p>
          <p>Puedes hacerlo usando el siguiente enlace (válido por 1 hora):</p>
          <p><a href="${link}">Restablecer contraseña</a></p>
          <p>Si no fuiste tú, ignora este correo.</p>
        `,
      })
    } catch (err: any) {
      console.error('[EmailService] SendGrid error (reset):', err?.response?.body || err?.message || err)
    }
  }

  async sendEmailVerificationCode(to: string, code: string, link: string) {
    if (!this.enabled) {
      console.log(`[EmailService:dev] Verification code for ${to}: ${code}`)
      console.log(`[EmailService:dev] Magic link: ${link}`)
      return
    }
    try {
      await sgMail.send({
        to,
        from: this.from,
        subject: 'Verifica tu correo',
        html: `
          <p>Tu código de verificación es:</p>
          <h2 style="font-size: 24px; letter-spacing: 4px;">${code}</h2>
          <p>Vence en 15 minutos. También puedes hacer clic aquí para verificar directamente:</p>
          <p><a href="${link}">Verificar correo</a></p>
          <p>Si no fuiste tú, ignora este correo.</p>
        `,
      })
    } catch (err: any) {
      console.error('[EmailService] SendGrid error (verify):', err?.response?.body || err?.message || err)
    }
  }
}
