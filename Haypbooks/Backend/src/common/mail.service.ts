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
    // Use customer's preferred wording for OTP emails
    return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #111">
        <h2>Hi there,</h2>
        <p>To keep your account secure, we need to confirm it's really you. Please enter the verification code we just sent to your email.</p>
        <p style="font-size:20px;font-weight:700;letter-spacing:2px">🔐 Your Verification Code: ${code}</p>
        <p><em>(This code will expire in 10 minutes.)</em></p>
        <p>Thanks for helping us keep HaypBooks secure and owner-friendly.</p>
        <p>— The HaypBooks Team</p>
      </div>
    `
  }

  buildVerifyEmailOtpText(name: string, code: string) {
    return `Hi there,\n\nTo keep your account secure, we need to confirm it's really you. Please enter the verification code we just sent to your email.\n\n🔐 Your Verification Code: ${code}\n\n(This code will expire in 10 minutes.)\n\nIf you didn’t request this, you can safely ignore this message.\n\nThanks for helping us keep HaypBooks secure and owner-friendly.\n\n— The HaypBooks Team`
  }
  buildPasswordResetHtml(name: string, code: string) {
    return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #111">
        <h2>Hi ${name || 'there'},</h2>
        <p>We received a request to reset your HaypBooks password. Use the code below to set a new one.</p>
        <p style="font-size:24px;font-weight:700;letter-spacing:3px">🔑 ${code}</p>
        <p><em>(This code expires in 60 minutes.)</em></p>
        <p>If you did not request a password reset, please ignore this email — your account remains secure.</p>
        <p>— The HaypBooks Team</p>
      </div>
    `
  }

  buildPasswordResetText(name: string, code: string) {
    return `Hi ${name || 'there'},\n\nWe received a request to reset your HaypBooks password. Use the code below to set a new one.\n\n🔑 Reset Code: ${code}\n\n(This code expires in 60 minutes.)\n\nIf you did not request a password reset, please ignore this email.\n\n— The HaypBooks Team`
  }

  buildInviteHtml(inviterName: string, workspaceName: string, link: string) {
    return `
      <div style="font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Arial; color: #111">
        <h2>You have been invited to HaypBooks</h2>
        <p><strong>${inviterName}</strong> has invited you to join <strong>${workspaceName}</strong> on HaypBooks.</p>
        <p><a href="${link}" style="display:inline-block;padding:12px 18px;background:#059669;color:#fff;border-radius:8px;text-decoration:none;">Accept Invitation</a></p>
        <p>This invitation expires in <strong>7 days</strong>.</p>
        <p>If you don't want to accept this invitation, you can safely ignore this email.</p>
        <p>— The HaypBooks Team</p>
      </div>
    `
  }

  buildInviteText(inviterName: string, workspaceName: string, link: string) {
    return `You have been invited to HaypBooks\n\n${inviterName} has invited you to join ${workspaceName} on HaypBooks.\n\nAccept here: ${link}\n\nThis invitation expires in 7 days.\n\n— The HaypBooks Team`
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
