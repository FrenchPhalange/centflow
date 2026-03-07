export default defineNuxtRouteMiddleware(async (to) => {
  const { user, initialized, fetchSession } = useAuth()

  // Toujours re-fetch la session au premier chargement
  // ou quand on arrive depuis un magic link callback
  if (!initialized.value || (import.meta.client && !user.value && to.path !== '/login')) {
    await fetchSession()
  }

  if (!user.value && to.path !== '/login') {
    // Transmettre l'erreur du magic link vers /login
    const error = to.query.error as string | undefined
    return navigateTo(error ? `/login?error=${error}` : '/login')
  }

  if (user.value && to.path === '/login') {
    return navigateTo('/')
  }
})
