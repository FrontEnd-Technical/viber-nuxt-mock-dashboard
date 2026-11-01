<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const authStore = useAuthStore()

async function returnToDashboard() {
  await navigateTo('/')
}

async function signInAsAdmin() {
  authStore.setMode('admin')
  await navigateTo('/login')
}
</script>

<template>
  <div class="guest-access-page">
    <v-card class="guest-access-card" rounded="xl" elevation="0">
      <v-avatar color="warning" rounded="lg" size="52" class="mb-5">
        <v-icon icon="mdi-lock-outline" size="26" />
      </v-avatar>
      <h1>Đăng nhập Admin để tiếp tục</h1>
      <p>
        Chế độ Guest chỉ cho phép xem dashboard mẫu. Trang này cần gọi API bằng
        access token của tài khoản Admin.
      </p>
      <div class="guest-access-card__actions">
        <v-btn variant="outlined" rounded="lg" @click="returnToDashboard">
          Về dashboard
        </v-btn>
        <v-btn color="primary" rounded="lg" @click="signInAsAdmin">
          Đăng nhập Admin
        </v-btn>
      </div>
    </v-card>
  </div>
</template>

<style scoped>
.guest-access-page {
  width: min(100%, 520px);
}

.guest-access-card {
  padding: 36px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: #fff;
}

.guest-access-card h1 {
  margin: 0 0 12px;
  font-size: 22px;
}

.guest-access-card p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.7;
}

.guest-access-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
