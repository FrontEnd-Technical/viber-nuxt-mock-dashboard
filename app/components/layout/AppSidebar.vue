<script setup lang="ts">
import {
  ADMIN_NAVIGATION,
  ADMIN_NAVIGATION_GROUPS,
  getAdminNavigationItem,
  isAdminNavigationItemActive,
  type AdminNavigationItem,
} from '~/utils/admin-navigation'

type SidebarTab = 'favorites' | 'recent'

const emit = defineEmits<{
  navigate: []
}>()

const route = useRoute()
const navigationStore = useNavigationStore()
const selectedTab = ref<SidebarTab>('favorites')
const expandedGroups = ref<Record<string, boolean>>({
  overview: true,
  'hotel-management': true,
  system: true,
})

const navigationGroups = computed(() =>
  ADMIN_NAVIGATION_GROUPS.map(group => ({
    ...group,
    items: ADMIN_NAVIGATION.filter(item => item.group === group.id),
  })),
)

const quickLinks = computed(() => {
  const paths = selectedTab.value === 'favorites'
    ? navigationStore.favorites
    : navigationStore.recentRoutes
  return paths
    .map(path => ADMIN_NAVIGATION.find(item => item.to === path))
    .filter((item): item is AdminNavigationItem => item !== undefined)
})

const activeItem = computed(() => getAdminNavigationItem(route.path))

function isActive(item: AdminNavigationItem): boolean {
  return isAdminNavigationItemActive(route.path, item)
}

watch(
  () => route.path,
  (path) => {
    navigationStore.recordRecent(activeItem.value?.to ?? path)
    if (activeItem.value) {
      expandedGroups.value[activeItem.value.group] = true
    }
  },
)

onMounted(() => {
  navigationStore.hydrate()
  navigationStore.recordRecent(activeItem.value?.to ?? route.path)
})
</script>

<template>
  <aside class="app-sidebar">
    <div class="app-sidebar__brand">
      <v-avatar color="secondary" rounded="lg" size="36">
        <v-icon icon="mdi-office-building-outline" size="20" />
      </v-avatar>
      <div class="app-sidebar__brand-copy">
        <div class="app-sidebar__brand-name">Staywise</div>
        <div class="app-sidebar__brand-caption">Quản lý khách sạn</div>
      </div>
    </div>

    <div class="app-sidebar__content">
      <section class="app-sidebar__quick-section" aria-label="Điều hướng nhanh">
        <div class="app-sidebar__tabs" role="group" aria-label="Trang nhanh">
          <button
            type="button"
            :aria-pressed="selectedTab === 'favorites'"
            :class="{ 'is-selected': selectedTab === 'favorites' }"
            @click="selectedTab = 'favorites'"
          >
            Yêu thích
          </button>
          <button
            type="button"
            :aria-pressed="selectedTab === 'recent'"
            :class="{ 'is-selected': selectedTab === 'recent' }"
            @click="selectedTab = 'recent'"
          >
            Gần đây
          </button>
        </div>

        <v-list v-if="quickLinks.length" nav class="app-sidebar__list">
          <div
            v-for="item in quickLinks"
            :key="item.to"
            class="app-sidebar__route-row"
            :class="{ 'is-active': isActive(item) }"
          >
            <v-list-item
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              :active="false"
              rounded="lg"
              class="app-sidebar__item"
              @click="emit('navigate')"
            />
          </div>
        </v-list>
        <p v-else class="app-sidebar__empty">
          {{ selectedTab === 'favorites'
            ? 'Dùng biểu tượng sao cạnh tiêu đề trang để thêm lối tắt.'
            : 'Các trang bạn mở gần đây sẽ hiển thị ở đây.' }}
        </p>
      </section>

      <v-divider class="app-sidebar__divider" />

      <section
        v-for="group in navigationGroups"
        :key="group.id"
        class="app-sidebar__group"
      >
        <button
          type="button"
          class="app-sidebar__group-heading"
          :aria-expanded="expandedGroups[group.id]"
          @click="expandedGroups[group.id] = !expandedGroups[group.id]"
        >
          <span>{{ group.title }}</span>
          <v-icon
            :icon="expandedGroups[group.id] ? 'mdi-chevron-down' : 'mdi-chevron-right'"
            size="16"
          />
        </button>

        <v-list v-if="expandedGroups[group.id]" nav class="app-sidebar__list">
          <div
            v-for="item in group.items"
            :key="item.to"
            class="app-sidebar__route-row"
            :class="{ 'is-active': isActive(item) }"
          >
            <v-list-item
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              :active="false"
              rounded="lg"
              class="app-sidebar__item"
              @click="emit('navigate')"
            />
          </div>
        </v-list>
      </section>
    </div>

    <div class="app-sidebar__property">
      <v-divider class="app-sidebar__divider" />
      <div class="app-sidebar__property-switcher">
        <v-avatar color="grey-lighten-3" size="32">
          <v-icon icon="mdi-domain" size="18" />
        </v-avatar>
        <div class="app-sidebar__property-details">
          <span>Đang quản lý</span>
          <strong>Khách sạn của bạn</strong>
        </div>
        <v-icon icon="mdi-chevron-down" size="18" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
.app-sidebar {
  display: flex;
  width: 100%;
  height: 100%;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  background: var(--color-page);
}

.app-sidebar__brand {
  display: flex;
  min-height: 68px;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
}

.app-sidebar__brand-copy {
  min-width: 0;
}

.app-sidebar__brand-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 20px;
}

.app-sidebar__brand-caption {
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
}

.app-sidebar__content {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 4px 16px 12px;
}

.app-sidebar__tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-bottom: 8px;
  padding: 3px;
  border-radius: 8px;
  background: #f5f5f6;
}

.app-sidebar__tabs button {
  min-width: 0;
  min-height: 30px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
}

.app-sidebar__tabs button.is-selected {
  background: #fff;
  color: var(--color-text);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.app-sidebar__tabs button:focus-visible,
.app-sidebar__group-heading:focus-visible {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
}

.app-sidebar__list {
  padding: 0;
}

.app-sidebar__item {
  min-width: 0;
  flex: 1;
  min-height: 36px;
  padding-inline: 8px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.app-sidebar__item :deep(.v-list-item__prepend > .v-icon) {
  margin-inline-end: 10px;
  font-size: 18px;
}

.app-sidebar__item :deep(.v-list-item-title) {
  font-size: 12px;
  font-weight: 500;
}

.app-sidebar__route-row {
  display: flex;
  min-width: 0;
  align-items: center;
  border-radius: 8px;
}

.app-sidebar__route-row.is-active {
  background: rgba(0, 0, 0, 0.06);
  color: var(--color-text);
}

.app-sidebar__empty {
  margin: 8px 4px 12px;
  color: var(--color-text-muted);
  font-size: 11px;
  line-height: 16px;
}

.app-sidebar__divider {
  margin: 12px 0;
}

.app-sidebar__group {
  padding-bottom: 8px;
}

.app-sidebar__group-heading {
  display: flex;
  width: 100%;
  min-height: 32px;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  border: 0;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 11px;
  font-weight: 600;
  text-align: left;
}

.app-sidebar__property {
  flex: 0 0 auto;
  padding: 0 16px 12px;
}

.app-sidebar__property-switcher {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0 0;
}

.app-sidebar__property-details {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  font-size: 11px;
}

.app-sidebar__property-details span {
  color: var(--color-text-muted);
}

.app-sidebar__property-details strong {
  overflow: hidden;
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
