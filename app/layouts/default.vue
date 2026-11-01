<script setup lang="ts">
import { useDisplay } from 'vuetify'
import AppNotificationsSidebar from '~/components/layout/AppNotificationsSidebar.vue'
import AppSidebar from '~/components/layout/AppSidebar.vue'
import AppTopbar from '~/components/layout/AppTopbar.vue'

const { mdAndUp } = useDisplay()
const drawer = ref(mdAndUp.value)
const notificationsOpen = ref(false)

watch(mdAndUp, (isDesktop, wasDesktop) => {
  if (isDesktop !== wasDesktop) {
    drawer.value = isDesktop
    notificationsOpen.value = false
  }
})

function closeSidebarOnMobile() {
  if (!mdAndUp.value) {
    drawer.value = false
  }
}
</script>

<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      :permanent="mdAndUp && drawer"
      :temporary="!mdAndUp"
      width="212"
      color="white"
    >
      <AppSidebar @navigate="closeSidebarOnMobile" />
    </v-navigation-drawer>

    <v-navigation-drawer
      v-model="notificationsOpen"
      location="right"
      :permanent="mdAndUp && notificationsOpen"
      :temporary="!mdAndUp"
      width="280"
      class="app-notifications-drawer"
      aria-label="Thông báo và hoạt động"
    >
      <AppNotificationsSidebar
        id="app-notifications-sidebar"
        @close="notificationsOpen = false"
      />
    </v-navigation-drawer>

    <AppTopbar
      :notifications-open="notificationsOpen"
      @toggle-navigation="drawer = !drawer"
      @toggle-notifications="notificationsOpen = !notificationsOpen"
    />

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>
