<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  type?: 'success' | 'error'
  details?: string[]
}>(), {
  type: 'success',
  details: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})
</script>

<template>
  <v-dialog v-model="isOpen" max-width="440">
    <v-card class="operation-result" rounded="xl">
      <div class="operation-result__icon" :class="`operation-result__icon--${type}`">
        <v-icon
          :icon="type === 'success' ? 'mdi-check-circle-outline' : 'mdi-alert-circle-outline'"
          size="28"
        />
      </div>
      <v-card-title class="operation-result__title">
        {{ title }}
      </v-card-title>
      <v-card-text class="operation-result__body">
        <p>{{ message }}</p>
        <ul v-if="details.length" class="operation-result__details">
          <li v-for="(detail, index) in details" :key="`${index}-${detail}`">
            {{ detail }}
          </li>
        </ul>
      </v-card-text>
      <v-card-actions class="operation-result__actions">
        <v-btn
          :color="type === 'success' ? 'primary' : 'error'"
          min-width="100"
          @click="isOpen = false"
        >
          Đóng
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.operation-result {
  padding: 28px 24px 20px;
  text-align: center;
}

.operation-result__icon {
  display: grid;
  width: 56px;
  height: 56px;
  margin: 0 auto 12px;
  place-items: center;
  border-radius: 50%;
}

.operation-result__icon--success {
  background: rgba(113, 221, 140, 0.18);
  color: #248a45;
}

.operation-result__icon--error {
  background: rgba(198, 40, 40, 0.1);
  color: rgb(var(--v-theme-error));
}

.operation-result__title {
  justify-content: center;
  padding: 0;
  font-size: 17px;
  font-weight: 600;
  white-space: normal;
  overflow-wrap: anywhere;
}

.operation-result__body {
  padding: 10px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
}

.operation-result__body p {
  margin: 0;
}

.operation-result__details {
  display: grid;
  gap: 4px;
  margin: 10px 0 0;
  padding-left: 18px;
  text-align: left;
}

.operation-result__actions {
  justify-content: center;
  padding: 20px 0 0;
}
</style>
