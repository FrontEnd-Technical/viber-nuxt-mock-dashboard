<script setup lang="ts">
import type { AuthMode } from '~/stores/auth'
import { ApiError, toApiError } from '~/utils/api-response'

interface LoginTokens {
  accessToken: string
  refreshToken: string
}

definePageMeta({
  layout: 'auth',
})

const route = useRoute()
const authStore = useAuthStore()
const api = useApi()

const mode = ref<AuthMode>('admin')
const username = ref('')
const password = ref('')
const pending = ref(false)
const formError = ref<ApiError | null>(null)

const modeOptions = [
  { title: 'Admin', value: 'admin' },
  { title: 'Guest', value: 'guest' },
]

const usernameErrors = computed(() =>
  formError.value?.errors
    ?.filter(error => error.field?.toLowerCase() === 'username')
    .map(error => error.message) ?? [],
)

const passwordErrors = computed(() =>
  formError.value?.errors
    ?.filter(error => error.field?.toLowerCase() === 'password')
    .map(error => error.message) ?? [],
)

function getRedirectPath(): string {
  const redirect = route.query.redirect
  return typeof redirect === 'string'
    && redirect.startsWith('/')
    && !redirect.startsWith('//')
    && redirect !== '/login'
      ? redirect
      : '/'
}

function readLoginResponse(value: unknown): LoginTokens {
  if (
    typeof value !== 'object'
    || value === null
    || !('accessToken' in value)
    || typeof value.accessToken !== 'string'
    || !('refreshToken' in value)
    || typeof value.refreshToken !== 'string'
  ) {
    throw new ApiError(
      'Dữ liệu đăng nhập API trả về không hợp lệ.',
      502,
      'INVALID_LOGIN_RESPONSE',
      value,
    )
  }

  return {
    accessToken: value.accessToken,
    refreshToken: value.refreshToken,
  }
}

async function submit() {
  formError.value = null
  authStore.setSessionNotice(null)

  if (mode.value === 'guest') {
    authStore.setMode('guest')
    await navigateTo('/')
    return
  }

  if (!username.value.trim() || !password.value) {
    formError.value = new ApiError(
      'Vui lòng nhập tên đăng nhập và mật khẩu.',
      400,
      'VALIDATION_ERROR',
    )
    return
  }

  pending.value = true
  authStore.setMode('admin')

  try {
    const response = await api<unknown>('/auth/login', {
      method: 'POST',
      body: {
        username: username.value.trim(),
        password: password.value,
      },
    })
    const login = readLoginResponse(response)

    authStore.setTokens({
      accessToken: login.accessToken,
      refreshToken: login.refreshToken,
    })
    await navigateTo(getRedirectPath())
  }
  catch (cause) {
    formError.value = toApiError(cause)
  }
  finally {
    pending.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <v-card class="login-card" rounded="xl" elevation="0">
      <div class="login-card__brand">
        <v-avatar color="secondary" rounded="lg" size="44">
          <v-icon icon="mdi-office-building-outline" size="24" />
        </v-avatar>
        <div>
          <div class="login-card__brand-name">Staywise</div>
          <div class="login-card__brand-caption">Quản lý khách sạn</div>
        </div>
      </div>

      <div class="login-card__heading">
        <h1>Đăng nhập</h1>
        <p>Đăng nhập để tiếp tục quản lý khách sạn của bạn.</p>
      </div>

      <v-alert
        v-if="authStore.sessionNotice"
        class="login-card__error"
        type="warning"
        variant="tonal"
        closable
        role="status"
        @click:close="authStore.setSessionNotice(null)"
      >
        {{ authStore.sessionNotice }}
      </v-alert>

      <v-alert
        v-if="formError"
        class="login-card__error"
        type="error"
        variant="tonal"
        role="alert"
        aria-live="polite"
      >
        <div class="login-card__error-message">
          {{ formError.message }}
        </div>
        <ul v-if="formError.errors?.length" class="login-card__error-list">
          <li v-for="(error, index) in formError.errors" :key="`${error.field ?? 'error'}-${index}`">
            <strong v-if="error.field">{{ error.field }}: </strong>{{ error.message }}
          </li>
        </ul>
        <small v-if="formError.errorCode" class="login-card__error-code">
          {{ formError.errorCode }}
        </small>
      </v-alert>

      <form class="login-form" @submit.prevent="submit">
        <v-text-field
          v-model="username"
          label="Tên đăng nhập"
          placeholder="Nhập username"
          autocomplete="username"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          rounded="lg"
          :disabled="pending"
          :error-messages="usernameErrors"
          @update:model-value="formError = null"
        />
        <v-text-field
          v-model="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu"
          autocomplete="current-password"
          prepend-inner-icon="mdi-lock-outline"
          variant="outlined"
          rounded="lg"
          :type="'password'"
          :disabled="pending"
          :error-messages="passwordErrors"
          @update:model-value="formError = null"
        />

        <div class="login-form__actions">
          <v-select
            v-model="mode"
            :items="modeOptions"
            label="Chế độ"
            aria-label="Chế độ đăng nhập"
            variant="outlined"
            rounded="lg"
            density="comfortable"
            hide-details
            :disabled="pending"
            class="login-form__mode"
            @update:model-value="formError = null"
          />
          <v-btn
            type="submit"
            color="primary"
            rounded="lg"
            size="large"
            :loading="pending"
            class="login-form__submit"
          >
            {{ mode === 'guest' ? 'Vào dashboard' : 'Đăng nhập' }}
          </v-btn>
        </div>
      </form>

      <p class="login-card__mode-hint">
        {{ mode === 'guest'
          ? 'Guest chỉ xem dashboard mẫu. Các trang nghiệp vụ yêu cầu đăng nhập Admin.'
          : 'Chế độ Admin cần xác thực bằng tài khoản hệ thống.' }}
      </p>
    </v-card>
  </div>
</template>

<style scoped>
.login-page {
  width: min(100%, 440px);
}

.login-card {
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.login-card__brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-card__brand-name {
  font-size: 16px;
  font-weight: 600;
}

.login-card__brand-caption,
.login-card__heading p,
.login-card__mode-hint {
  color: var(--color-text-muted);
  font-size: 12px;
}

.login-card__heading {
  margin: 32px 0 24px;
}

.login-card__heading h1 {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}

.login-card__heading p {
  margin: 0;
  line-height: 1.6;
}

.login-card__error {
  margin-bottom: 20px;
}

.login-card__error-message {
  font-weight: 600;
}

.login-card__error-list {
  margin: 8px 0 0;
  padding-left: 18px;
}

.login-card__error-code {
  display: block;
  margin-top: 8px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-form__actions {
  display: grid;
  grid-template-columns: minmax(112px, 0.72fr) minmax(0, 1.28fr);
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.login-form__submit {
  min-width: 0;
}

.login-card__mode-hint {
  margin: 18px 0 0;
  line-height: 1.6;
}

@media (max-width: 480px) {
  .login-card {
    padding: 26px 20px;
  }

  .login-form__actions {
    grid-template-columns: minmax(100px, 0.8fr) minmax(0, 1.2fr);
    gap: 8px;
  }
}
</style>
