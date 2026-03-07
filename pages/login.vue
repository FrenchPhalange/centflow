<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { sendMagicLink } = useAuth()

const route = useRoute()
const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

const magicLinkErrors: Record<string, string> = {
  EXPIRED_TOKEN: 'Le lien a expiré. Veuillez en demander un nouveau.',
  INVALID_TOKEN: 'Le lien est invalide. Veuillez en demander un nouveau.',
  USER_NOT_FOUND: 'Aucun compte associé à cet email.',
}

onMounted(() => {
  const queryError = route.query.error as string | undefined
  if (queryError && magicLinkErrors[queryError]) {
    error.value = magicLinkErrors[queryError]
  }
})

async function onSubmit() {
  error.value = ''
  loading.value = true
  try {
    const result = await sendMagicLink(email.value)
    if (result.error) {
      error.value = result.error.message || 'Erreur lors de l\'envoi du lien'
    } else {
      sent.value = true
    }
  } catch (err: any) {
    console.error('[login] sendMagicLink error:', err)
    error.value = err?.message || 'Erreur de connexion'
  } finally {
    loading.value = false
  }
}

function reset() {
  sent.value = false
  error.value = ''
  email.value = ''
}
</script>

<template>
  <div class="w-full">
    <!-- Brand -->
    <div class="text-center mb-10">
      <div class="w-14 h-14 rounded-2xl bg-[var(--color-sage)] flex items-center justify-center mx-auto mb-4 shadow-[var(--shadow-md)]">
        <UIcon name="i-lucide-wallet" class="text-white text-2xl" />
      </div>
      <h1 class="font-display text-3xl text-[var(--color-text)] mb-1.5">Centflow</h1>
      <p class="text-sm text-[var(--color-text-muted)]">Gerez votre budget en famille</p>
    </div>

    <!-- Success state -->
    <Transition name="slide">
      <div v-if="sent" class="card-padded text-center space-y-5">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-[var(--color-sage-light)] flex items-center justify-center">
          <UIcon name="i-lucide-mail-check" class="text-2xl text-[var(--color-sage)]" />
        </div>
        <div>
          <h2 class="font-display text-xl mb-2">Lien envoyé !</h2>
          <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
            Un lien de connexion a été envoyé à<br>
            <strong class="text-[var(--color-text)]">{{ email }}</strong>
          </p>
          <p v-if="!$config.public.betterAuthUrl || $config.public.betterAuthUrl.includes('localhost')" class="text-xs text-[var(--color-text-muted)] mt-2 bg-[var(--color-bg)] rounded-lg p-2.5">
            💡 Consultez la console du serveur pour obtenir le lien en développement.
          </p>
        </div>
        <button
          class="text-sm font-medium text-[var(--color-sage)] hover:underline"
          @click="reset"
        >
          Utiliser un autre email
        </button>
      </div>
    </Transition>

    <!-- Login form -->
    <Transition name="slide">
      <form v-if="!sent" class="card-padded space-y-4" @submit.prevent="onSubmit">
        <!-- Error -->
        <div
          v-if="error"
          class="flex items-start gap-2.5 p-3 rounded-xl bg-[var(--color-terracotta-light)] text-[var(--color-terracotta)]"
        >
          <UIcon name="i-lucide-alert-circle" class="text-base shrink-0 mt-0.5" />
          <span class="text-sm">{{ error }}</span>
        </div>

        <!-- Email field -->
        <div class="space-y-1.5">
          <label for="email" class="block text-sm font-semibold text-[var(--color-text)]">Adresse email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            autocomplete="email"
            class="text-input"
            placeholder="votre@email.com"
          >
        </div>

        <!-- Submit -->
        <button
          type="submit"
          :disabled="loading"
          class="w-full py-3 rounded-xl bg-[var(--color-sage)] text-white font-semibold text-sm hover:opacity-90 active:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2 shadow-[var(--shadow-sm)]"
        >
          <UIcon v-if="loading" name="i-lucide-loader-2" class="animate-spin" />
          <span>{{ loading ? 'Envoi en cours…' : 'Recevoir un lien de connexion' }}</span>
        </button>

        <p class="text-xs text-center text-[var(--color-text-muted)] leading-relaxed">
          Un lien magique et sécurisé sera envoyé à votre adresse email.
        </p>
      </form>
    </Transition>
  </div>
</template>
