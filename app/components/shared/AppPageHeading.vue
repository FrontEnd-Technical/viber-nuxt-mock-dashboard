<script setup lang="ts">
import { getAdminNavigationItem } from '~/utils/admin-navigation'

defineProps<{
  title: string
}>()

const route = useRoute()
const navigationStore = useNavigationStore()
const navigationItem = computed(() => getAdminNavigationItem(route.path))
const isFavorite = computed(() => {
  const path = navigationItem.value?.to
  return path !== undefined && navigationStore.favorites.includes(path)
})

function toggleFavorite() {
  const path = navigationItem.value?.to
  if (path) {
    navigationStore.toggleFavorite(path)
  }
}
</script>

<template>
  <div class="app-page-heading">
    <h1 class="admin-page__title">{{ title }}</h1>
    <v-btn
      v-if="navigationItem"
      icon
      variant="text"
      density="comfortable"
      size="small"
      class="app-page-heading__favorite"
      :aria-label="isFavorite ? `Bỏ yêu thích ${title}` : `Thêm ${title} vào yêu thích`"
      :aria-pressed="isFavorite"
      @click="toggleFavorite"
    >
      <v-icon :icon="isFavorite ? 'mdi-star' : 'mdi-star-outline'" size="20" />
    </v-btn>
  </div>
</template>

<style scoped>
.app-page-heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.app-page-heading__favorite {
  flex: 0 0 auto;
  color: var(--color-text-muted);
}

.app-page-heading__favorite[aria-pressed='true'] {
  color: var(--color-text);
}
</style>
