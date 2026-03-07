import { authClient } from '~/lib/auth-client'

interface AuthUser {
  id: string
  name: string
  email: string
}

export function useAuth() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const loading = useState<boolean>('auth-loading', () => true)
  const initialized = useState<boolean>('auth-initialized', () => false)

  async function fetchSession() {
    try {
      // En SSR, $fetch ne transmet pas les cookies du navigateur automatiquement.
      // useRequestHeaders forward les cookies de la requête entrante vers l'appel interne.
      const headers = import.meta.server ? useRequestHeaders(['cookie']) : undefined
      const data = await $fetch<{ user: AuthUser | null }>('/api/_session', { headers })
      user.value = data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function sendMagicLink(email: string) {
    try {
      const data = await $fetch('/api/auth/sign-in/magic-link', {
        method: 'POST',
        body: { email, callbackURL: '/' },
      })
      return { data, error: null }
    } catch (err: any) {
      console.error('[useAuth] sendMagicLink failed:', err)
      const message = err?.data?.message || err?.message || 'Erreur lors de l\'envoi du lien'
      return { data: null, error: { message } }
    }
  }

  function resetSession() {
    initialized.value = false
    user.value = null
    loading.value = true
  }

  async function logout() {
    await authClient.signOut()
    user.value = null
    await navigateTo('/login')
  }

  function getInitial(name?: string) {
    return name ? name.charAt(0).toUpperCase() : '?'
  }

  return {
    user,
    loading,
    initialized,
    fetchSession,
    resetSession,
    sendMagicLink,
    logout,
    getInitial,
  }
}
