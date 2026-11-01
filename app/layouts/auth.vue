<template>
  <v-app>
    <v-main class="auth-layout">
      <slot />
    </v-main>
  </v-app>
</template>

<style scoped>
.auth-layout {
  display: grid;
  min-height: 100vh;
  place-items: center;
  padding: 24px;
  background:
    radial-gradient(ellipse at 12% 8%, rgba(189, 167, 242, 0.18), transparent 34%),
    radial-gradient(ellipse at 88% 92%, rgba(160, 188, 232, 0.2), transparent 36%),
    var(--color-surface);
}
</style>
