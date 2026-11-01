<script setup lang="ts">
import AppGlobalLoading from '~/components/layout/AppGlobalLoading.vue'

const router = useRouter()
const loadingStore = useLoadingStore()

router.beforeEach(() => {
  loadingStore.beginNavigation()
})

router.afterEach(() => {
  loadingStore.endNavigation()
})

router.onError(() => {
  loadingStore.endNavigation()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
    <AppGlobalLoading />
  </NuxtLayout>
</template>
