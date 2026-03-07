import { betterAuth } from 'better-auth'
import { magicLink } from 'better-auth/plugins'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { Resend } from 'resend'
import { useDB } from '~/server/database'
import * as schema from '~/server/database/schema'

let _auth: ReturnType<typeof betterAuth> | null = null

export function useServerAuth() {
  if (!_auth) {
    const config = useRuntimeConfig()
    const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null
    const fromEmail = config.resendFrom || 'Centflow <onboarding@resend.dev>'

    _auth = betterAuth({
      baseURL: config.betterAuthUrl,
      secret: config.betterAuthSecret,

      database: drizzleAdapter(useDB(), {
        provider: 'sqlite',
        schema: {
          user: schema.user,
          session: schema.session,
          verification: schema.verification,
        },
      }),

      emailAndPassword: {
        enabled: false,
      },

      plugins: [
        magicLink({
          expiresIn: 600, // 10 minutes
          sendMagicLink: async ({ email, url }) => {
            if (resend) {
              try {
                await resend.emails.send({
                  from: fromEmail,
                  to: email,
                  subject: 'Connexion — Centflow',
                  html: `
                    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
                      <h1 style="font-size: 24px; color: #2C2416; margin-bottom: 8px;">Centflow</h1>
                      <p style="color: #8A7E6E; font-size: 15px; margin-bottom: 32px;">Cliquez sur le bouton ci-dessous pour vous connecter.</p>
                      <a href="${url}" style="display: inline-block; background-color: #5B7C5E; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 15px; font-weight: 600;">
                        Se connecter
                      </a>
                      <p style="color: #8A7E6E; font-size: 13px; margin-top: 32px;">Ce lien expire dans 10 minutes. Si vous n'avez pas demandé cette connexion, ignorez cet email.</p>
                    </div>
                  `,
                })
                console.log(`[auth] Email envoyé à ${email}`)
              } catch (err) {
                console.warn(`[auth] Échec envoi email à ${email}:`, err)
              }
            } else {
              // Fallback console si pas de clé Resend
              console.log('')
              console.log('═══════════════════════════════════════════════')
              console.log(`  🔗 Magic Link pour ${email}`)
              console.log(`  ${url}`)
              console.log('═══════════════════════════════════════════════')
              console.log('')
            }
          },
          disableSignUp: true,
        }),
      ],

      session: {
        expiresIn: 60 * 60 * 24 * 365, // 1 an
        updateAge: 60 * 60 * 24, // rafraîchit la session chaque jour
        cookieCache: {
          enabled: true,
          maxAge: 60 * 60, // cache 1h (évite les appels DB inutiles)
        },
      },

      advanced: {
        defaultCookieAttributes: {
          sameSite: 'lax',
          secure: true,
        },
      },

      rateLimit: {
        window: 60,
        max: 5,
      },

      trustedOrigins: [config.betterAuthUrl],
    })
  }

  return _auth
}
