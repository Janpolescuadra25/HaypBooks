import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  buildVerifyEmailHtml(name: string, url: string) {
    return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #111">
        <h2>Hello ${name},</h2>
        <p>Welcome to Haypbooks — click below to verify your email address.</p>
        <p><a href="${url}" style="display:inline-block;padding:12px 18px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;">Verify email</a></p>
        <p>If that doesn't work, copy and paste this URL into your browser: <code>${url}</code></p>
      </div>
    `
  }

  buildVerifyEmailText(name: string, url: string) {
    return `Hello ${name}\n\nWelcome to Haypbooks — use the link below to verify your email:\n${url}\n\nIf the link doesn't work, copy and paste it into your browser.`
  }

  buildVerifyEmailOtpHtml(name: string, code: string) {
    // HTML email that contains the OTP code and instructions
    return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #111">
        <h2>Hi ${name},</h2>
        <p>Your one-time password (OTP) for <strong>Haypbooks</strong> is:</p>
        <p style="font-size:20px;font-weight:700;letter-spacing:2px">${code}</p>
        <p>Please enter this code to verify your action and continue securely.</p>
        <p>⏱️ This code will expire in <strong>5 minutes</strong>.<br/>🔒 For your protection, never share this code with anyone. Haypbooks will never ask for it via phone or chat.</p>
        <p>If you did not request this verification, you can safely ignore this email or contact our support team.</p>
        <p>Best regards,<br/><strong>The Haypbooks Team</strong><br/>Accounting made simpler.</p>
      </div>
    `
  }

  buildVerifyEmailOtpText(name: string, code: string) {
    return `Hi ${name},\n\nYour one-time password (OTP) for Haypbooks is:\n\n${code}\n\nPlease enter this code to verify your action and continue securely.\n\nThis code will expire in 5 minutes. For your protection, never share this code with anyone. Haypbooks will never ask for it via phone or chat.\n\nIf you did not request this verification, you can safely ignore this email or contact our support team.\n\nBest regards,\nThe Haypbooks Team\nAccounting made simpler.`
  }

  async sendEmail(to: string, subject: string, html: string, text: string) {
    // Prefer SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      try {
        // Dynamic import so package is optional in dev
        const sgMail = await import('@sendgrid/mail')
        sgMail.default.setApiKey(process.env.SENDGRID_API_KEY)
        await sgMail.default.send({ to, from: process.env.SENDGRID_FROM || 'no-reply@haypbooks.local', subject, html, text })
        this.logger.log(`Sent email to ${to} via SendGrid`) 
        return
      } catch (e) {
        this.logger.warn('SendGrid failed, falling back to console: ' + (e?.message || e))
      }
    }

    // Fallback: nodemailer if configured
    if (process.env.SMTP_HOST) {
      try {
        const nodemailer = await import('nodemailer')
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === '1' || process.env.SMTP_SECURE === 'true',
          auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
        })
        await transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@haypbooks.local', to, subject, html, text })
        this.logger.log(`Sent email to ${to} via SMTP`) 
        return
      } catch (e) {
        this.logger.warn('SMTP send failed, falling back to console: ' + (e?.message || e))
      }
    }

    // Dev fallback: log to console and return
    this.logger.warn(`Email send (dev): to=${to}, subject=${subject}\n${text}`)
  }
}
