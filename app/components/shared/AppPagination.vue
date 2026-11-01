<script setup lang="ts">
import { PAGE_SIZE_OPTIONS } from '~/utils/pagination'

withDefaults(defineProps<{
  page: number
  pageCount: number
  pageSize: number
  pageSizeOptions?: number[]
  disabled?: boolean
  paginationDisabled?: boolean
  ariaLabel: string
}>(), {
  pageSizeOptions: () => [...PAGE_SIZE_OPTIONS],
  disabled: false,
  paginationDisabled: false,
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: unknown]
}>()
</script>

<template>
  <div class="app-pagination">
    <div class="app-pagination__details">
      <span class="app-pagination__page-size-label">Số dòng/trang</span>
      <v-select
        :model-value="pageSize"
        :items="pageSizeOptions"
        aria-label="Số dòng mỗi trang"
        density="compact"
        variant="outlined"
        hide-details
        :disabled="disabled"
        @update:model-value="emit('update:pageSize', $event)"
      />
      <span class="app-pagination__caption">Trang {{ page }} / {{ pageCount }}</span>
    </div>
    <v-pagination
      :model-value="page"
      :length="pageCount"
      :total-visible="5"
      :disabled="disabled || paginationDisabled"
      density="comfortable"
      rounded="lg"
      :aria-label="ariaLabel"
      @update:model-value="emit('update:page', $event)"
    />
  </div>
</template>

<style scoped>
.app-pagination {
  display: flex;
  min-height: 52px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 24px 0;
}
.app-pagination__details { display: flex; align-items: center; gap: 8px; }
.app-pagination__page-size-label,
.app-pagination__caption { color: var(--color-text-muted); font-size: 12px; white-space: nowrap; }
.app-pagination__details :deep(.v-select) { width: 84px; }
.app-pagination :deep(.v-pagination__list) { justify-content: flex-end; }
@media (max-width: 700px) {
  .app-pagination { align-items: flex-start; flex-direction: column; padding-inline: 16px; }
  .app-pagination :deep(.v-pagination__list) { justify-content: flex-start; }
}
</style>
