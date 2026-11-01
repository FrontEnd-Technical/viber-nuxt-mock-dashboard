<script setup lang="ts">
import type { AuthUserProfile } from '#shared/types/auth'
import { normalizeAuthUser } from '~/utils/auth-user'
import { ApiError, toApiError } from '~/utils/api-response'

definePageMeta({
  title: 'Thông tin tài khoản',
})

const api = useApi()
const authStore = useAuthStore()
const profile = ref<AuthUserProfile | null>(authStore.profile)
const pending = ref(false)
const error = ref<ApiError | null>(null)

async function loadProfile() {
  pending.value = true
  error.value = null

  try {
    const response = await api<unknown>('/auth/me')
    profile.value = normalizeAuthUser(response)
    authStore.setProfile(profile.value)
  }
  catch (cause) {
    error.value = toApiError(cause)
  }
  finally {
    pending.value = false
  }
}

onMounted(() => {
  void loadProfile()
})
</script>

<template>
  <div class="admin-page profile-page">
    <header class="admin-page__header">
      <div>
        <h1 class="admin-page__title">Thông tin tài khoản</h1>
        <p class="admin-page__subtitle">Thông tin người dùng hiện đang đăng nhập.</p>
      </div>
      <v-btn
        prepend-icon="mdi-refresh"
        variant="outlined"
        rounded="lg"
        :loading="pending"
        @click="loadProfile"
      >
        Tải lại
      </v-btn>
    </header>

    <v-alert
      v-if="error"
      class="mb-6"
      type="error"
      variant="tonal"
      role="alert"
    >
      <div>{{ error.message }}</div>
      <div v-if="error.errorCode" class="text-caption mt-1">
        {{ error.errorCode }}
      </div>
      <div v-if="error.correlationId" class="text-caption mt-1">
        Mã tra cứu: {{ error.correlationId }}
      </div>
      <template #append>
        <v-btn variant="text" size="small" :loading="pending" @click="loadProfile">
          Thử lại
        </v-btn>
      </template>
    </v-alert>

    <v-skeleton-loader
      v-if="pending && !profile"
      type="card"
      rounded="xl"
    />

    <section v-else-if="profile" class="dashboard-panel profile-card">
      <div class="profile-card__identity">
        <v-avatar color="secondary" size="64">
          <span class="text-h6 font-weight-bold">
            {{ (profile.fullName ?? profile.username).slice(0, 2).toUpperCase() }}
          </span>
        </v-avatar>
        <div>
          <h2>{{ profile.fullName || profile.username }}</h2>
          <p>{{ profile.email || 'Chưa cập nhật email' }}</p>
        </div>
      </div>

      <v-divider />

      <dl class="profile-details">
        <div>
          <dt>Tên đăng nhập</dt>
          <dd>{{ profile.username }}</dd>
        </div>
        <div>
          <dt>Mã người dùng</dt>
          <dd>{{ profile.id }}</dd>
        </div>
        <div v-if="profile.status">
          <dt>Trạng thái tài khoản</dt>
          <dd>{{ profile.status }}</dd>
        </div>
        <div v-if="profile.authorities?.length">
          <dt>Quyền</dt>
          <dd>{{ profile.authorities.join(', ') }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 960px;
}

.profile-card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 28px;
}

.profile-card__identity {
  display: flex;
  align-items: center;
  gap: 18px;
}

.profile-card__identity h2 {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: 600;
}

.profile-card__identity p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.profile-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 0;
}

.profile-details dt {
  margin-bottom: 6px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.profile-details dd {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .profile-card {
    padding: 20px;
  }

  .profile-details {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
