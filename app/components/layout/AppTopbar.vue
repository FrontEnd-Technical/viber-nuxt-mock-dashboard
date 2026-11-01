<script setup lang="ts">
import {
  ADMIN_NAVIGATION,
  filterAdminNavigation,
  getBreadcrumbItems,
  getPageTitle,
} from '~/utils/admin-navigation'
import { toApiError } from '~/utils/api-response'

const emit = defineEmits<{
  toggleNavigation: []
  toggleNotifications: []
}>()

defineProps<{
  notificationsOpen: boolean
}>()

const route = useRoute()
const authStore = useAuthStore()
const api = useApi()
const searchOpen = ref(false)
const searchQuery = ref('')
const searchField = ref<{ focus: () => void } | null>(null)
const shortcutLabel = ref('Ctrl K')
const logoutPending = ref(false)

const pageTitle = computed(() => getPageTitle(route.path, route.meta.title))
const breadcrumbs = computed(() => getBreadcrumbItems(route.path, pageTitle.value))
const filteredNavigation = computed(() =>
  filterAdminNavigation(ADMIN_NAVIGATION, searchQuery.value),
)

function openSearch() {
  searchQuery.value = ''
  searchOpen.value = true
  nextTick(() => searchField.value?.focus())
}

async function navigateToPage(path: string) {
  searchOpen.value = false
  searchQuery.value = ''
  await navigateTo(path)
}

async function logout() {
  if (logoutPending.value) {
    return
  }

  logoutPending.value = true
  authStore.setSessionNotice(null)

  try {
    if (authStore.mode !== 'guest') {
      if (!authStore.refreshToken) {
        throw new Error('Không tìm thấy refresh token để kết thúc phiên trên máy chủ.')
      }

      await api('/auth/logout', {
        method: 'POST',
        body: { refreshToken: authStore.refreshToken },
      })
    }
  }
  catch (cause) {
    const error = toApiError(cause)
    authStore.setSessionNotice(
      `Đã đăng xuất khỏi thiết bị này nhưng máy chủ chưa xác nhận thu hồi phiên: ${error.message}`,
    )
  }
  finally {
    authStore.clearTokens()
    logoutPending.value = false
    await navigateTo('/login')
  }
}

function handleKeyboardShortcut(event: KeyboardEvent) {
  if (event.key.toLowerCase() !== 'k' || (!event.ctrlKey && !event.metaKey)) {
    return
  }

  event.preventDefault()
  openSearch()
}

onMounted(() => {
  shortcutLabel.value = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K'
  window.addEventListener('keydown', handleKeyboardShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut)
})
</script>

<template>
  <v-app-bar
    flat
    color="white"
    height="68"
    class="app-topbar"
  >
    <div class="app-topbar__leading">
      <v-btn
        icon="mdi-dock-left"
        variant="text"
        density="compact"
        aria-label="Ẩn hoặc hiện menu điều hướng"
        @click="emit('toggleNavigation')"
      />

      <v-breadcrumbs
        :items="breadcrumbs"
        density="compact"
        class="app-topbar__breadcrumbs"
      >
        <template #divider>
          <span class="app-topbar__divider">/</span>
        </template>
      </v-breadcrumbs>
    </div>

    <div class="app-topbar__actions">
      <v-btn
        class="app-topbar__search"
        variant="text"
        :aria-label="`Tìm kiếm trang, nhấn ${shortcutLabel}`"
        @click="openSearch"
      >
        <v-icon icon="mdi-magnify" size="16" />
        <span class="app-topbar__search-label">Tìm kiếm</span>
        <kbd>{{ shortcutLabel }}</kbd>
      </v-btn>

      <v-btn
        icon="mdi-bell-outline"
        variant="text"
        density="compact"
        aria-label="Thông báo"
        :aria-expanded="notificationsOpen"
        aria-controls="app-notifications-sidebar"
        :color="notificationsOpen ? 'primary' : undefined"
        @click="emit('toggleNotifications')"
      />

      <v-menu location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="text"
            rounded="lg"
            class="app-topbar__account"
            aria-label="Tài khoản"
          >
            <v-avatar color="secondary" size="36" class="app-topbar__avatar">
              <span class="text-caption font-weight-bold">
                {{ (authStore.profile?.fullName ?? authStore.profile?.username ?? 'AD').slice(0, 2).toUpperCase() }}
              </span>
            </v-avatar>
            <span class="app-topbar__user">
              <strong>{{ authStore.profile?.fullName ?? authStore.profile?.username ?? 'Admin' }}</strong>
              <span>Quản trị viên</span>
            </span>
            <v-icon icon="mdi-chevron-down" size="16" />
          </v-btn>
        </template>

        <v-list min-width="200" density="compact">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Thông tin tài khoản"
            to="/profile"
          />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Đăng xuất"
            :disabled="logoutPending"
            @click="logout"
          />
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <v-dialog
    v-model="searchOpen"
    max-width="480"
    scrollable
  >
    <v-card rounded="xl">
      <v-card-text class="pa-4">
        <v-text-field
          ref="searchField"
          v-model="searchQuery"
          autofocus
          clearable
          hide-details
          prepend-inner-icon="mdi-magnify"
          placeholder="Tìm trang quản lý..."
          variant="outlined"
          rounded="lg"
        />
      </v-card-text>

      <v-divider />

      <v-list class="py-2">
        <v-list-item
          v-for="item in filteredNavigation"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :subtitle="item.to"
          rounded="lg"
          @click="navigateToPage(item.to)"
        />
        <v-list-item
          v-if="!filteredNavigation.length"
          title="Không tìm thấy trang phù hợp"
          disabled
        />
      </v-list>

      <v-divider />

      <v-card-actions class="justify-space-between px-4">
        <span class="text-caption text-medium-emphasis">
          Nhấn Esc để đóng
        </span>
        <v-btn variant="text" @click="searchOpen = false">
          Đóng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.app-topbar {
  padding-inline: 28px;
  box-shadow: inset 0 -0.5px rgba(0, 0, 0, 0.2);
}

.app-topbar__leading,
.app-topbar__actions {
  display: flex;
  min-width: 0;
  align-items: center;
}

.app-topbar__account {
  min-width: 0;
  height: 44px;
  padding-inline: 4px;
}

.app-topbar__leading {
  flex: 1;
  gap: 8px;
}

.app-topbar__breadcrumbs {
  min-width: 0;
  padding: 0;
  overflow: hidden;
}

.app-topbar__breadcrumbs :deep(.v-breadcrumbs-item) {
  white-space: nowrap;
}

.app-topbar__breadcrumbs :deep(.v-breadcrumbs-item:last-child) {
  overflow: hidden;
  text-overflow: ellipsis;
}

.app-topbar__divider {
  color: rgba(0, 0, 0, 0.2);
}

.app-topbar__actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 8px;
}

.app-topbar__search {
  width: 160px;
  min-width: 0;
  height: 28px;
  justify-content: flex-start;
  padding-inline: 8px;
  margin-right: 12px;
  border-radius: 16px;
  background: rgba(0, 0, 0, 0.04);
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 400;
  letter-spacing: normal;
  text-transform: none;
}

.app-topbar__search-label {
  flex: 1;
  text-align: left;
}

.app-topbar__search kbd {
  padding: 1px 4px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.02);
  color: var(--color-text-muted);
  font-family: inherit;
  font-size: 11px;
  white-space: nowrap;
}

.app-topbar__user {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-left: 2px;
  font-size: 12px;
  white-space: nowrap;
}

.app-topbar__user span {
  color: var(--color-text-muted);
}

@media (max-width: 960px) {
  .app-topbar {
    padding-inline: 20px;
  }

  .app-topbar__user {
    display: none;
  }
}

@media (max-width: 600px) {
  .app-topbar {
    padding-inline: 12px;
  }

  .app-topbar__leading {
    gap: 2px;
  }

  .app-topbar__breadcrumbs :deep(.v-breadcrumbs-item:first-child),
  .app-topbar__breadcrumbs :deep(.v-breadcrumbs-divider) {
    display: none;
  }

  .app-topbar__search {
    width: 36px;
    padding-inline: 8px;
  }

  .app-topbar__search-label,
  .app-topbar__search kbd {
    display: none;
  }
}
</style>
