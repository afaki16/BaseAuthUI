<template>
  <div class="datatable-wrapper">
    <!-- Header Section -->
    <div class="datatable-header">
      <div class="datatable-title-section">
        <h2 v-if="title" class="datatable-title">{{ title }}</h2>
        <p v-if="description" class="datatable-description">{{ description }}</p>
      </div>
      
      <div class="datatable-actions">
        <!-- Search Bar -->
        <div v-if="showSearch" class="datatable-search">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              :placeholder="searchPlaceholder"
              class="datatable-search-input"
            />
            <div class="datatable-search-icon">
              <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Add Button -->
        <button
          v-if="showAddButton"
          type="button"
          @click="$emit('add')"
          class="datatable-add-button"
        >
          <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {{ addButtonText }}
        </button>
      </div>
    </div>

    <!-- Table Section -->
    <div class="datatable-table-section">
      <!-- Loading State -->
      <div v-if="loading" class="datatable-loading">
        <div class="datatable-loading-spinner"></div>
        <p class="datatable-loading-text">{{ loadingText }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredItems.length === 0" class="datatable-empty">
        <svg class="datatable-empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="datatable-empty-title">{{ emptyTitle }}</h3>
        <p class="datatable-empty-description">{{ emptyDescription }}</p>
        <button
          v-if="showAddButton"
          @click="$emit('add')"
          class="datatable-empty-button"
        >
          {{ addButtonText }}
        </button>
      </div>

      <!-- Data Table -->
      <div v-else class="datatable-table-container">
        <div class="datatable-table-wrapper">
          <table class="datatable-table">
            <thead class="datatable-thead">
              <tr>
                <th
                  v-for="field in fields"
                  :key="field.value"
                  scope="col"
                  class="datatable-th"
                  :class="{ 'datatable-th-sortable': field.sortable !== false }"
                  @click="field.sortable !== false ? handleSort(field.value) : null"
                >
                  <div class="datatable-th-content">
                    <span>{{ field.label }}</span>
                    <svg
                      v-if="field.sortable !== false"
                      class="datatable-sort-icon"
                      :class="{ 'datatable-sort-active': sortBy === field.value }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th v-if="showActions" scope="col" class="datatable-th datatable-th-actions">
                  <span class="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody class="datatable-tbody">
              <tr
                v-for="(item, index) in paginatedItems"
                :key="item.id || index"
                class="datatable-tr"
              >
                <td
                  v-for="field in fields"
                  :key="field.value"
                  class="datatable-td"
                >
                  <!-- Custom Cell Renderer -->
                  <slot
                    :name="`cell-${field.value}`"
                    :item="item"
                    :value="getItemValue(item, field.value)"
                    :field="field"
                  >
                    <!-- Default Cell Content -->
                    <span v-if="field.type === 'date'">
                      {{ formatDate(getItemValue(item, field.value)) }}
                    </span>
                    <span v-else-if="field.type === 'status'">
                      <span
                        class="datatable-status-chip"
                        :class="`datatable-status-${getItemValue(item, field.value)}`"
                      >
                        {{ getItemValue(item, field.value) }}
                      </span>
                    </span>
                    <span v-else>
                      {{ getItemValue(item, field.value) }}
                    </span>
                  </slot>
                </td>
                
                <!-- Actions Column -->
                <td v-if="showActions" class="datatable-td datatable-td-actions">
                  <div class="datatable-actions-group">
                    <slot name="actions" :item="item" :index="index">
                      <!-- Default Actions -->
                      <button
                        v-if="showViewButton"
                        @click="$emit('view', item)"
                        class="datatable-action-button datatable-action-view"
                        title="Görüntüle"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        v-if="showEditButton"
                        @click="$emit('edit', item)"
                        class="datatable-action-button datatable-action-edit"
                        title="Düzenle"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        v-if="showDeleteButton"
                        @click="$emit('delete', item)"
                        class="datatable-action-button datatable-action-delete"
                        title="Sil"
                      >
                        <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </slot>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="showPagination && totalPages > 1" class="datatable-pagination">
      <div class="datatable-pagination-info">
        <span class="datatable-pagination-text">
          {{ paginationInfo }}
        </span>
      </div>
      
      <div class="datatable-pagination-controls">
        <button
          @click="currentPage = Math.max(1, currentPage - 1)"
          :disabled="currentPage === 1"
          class="datatable-pagination-button"
          :class="{ 'datatable-pagination-button-disabled': currentPage === 1 }"
        >
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Önceki
        </button>
        
        <div class="datatable-pagination-pages">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="currentPage = page"
            class="datatable-pagination-page"
            :class="{ 'datatable-pagination-page-active': currentPage === page }"
          >
            {{ page }}
          </button>
        </div>
        
        <button
          @click="currentPage = Math.min(totalPages, currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="datatable-pagination-button"
          :class="{ 'datatable-pagination-button-disabled': currentPage === totalPages }"
        >
          Sonraki
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

interface Field {
  label: string
  value: string
  sortable?: boolean
  type?: 'text' | 'date' | 'status' | 'number'
}

interface Item {
  [key: string]: any
}

// Props
const props = withDefaults(defineProps<{
  title?: string
  description?: string
  fields: Field[]
  items: Item[]
  loading?: boolean
  loadingText?: string
  emptyTitle?: string
  emptyDescription?: string
  showSearch?: boolean
  searchPlaceholder?: string
  showAddButton?: boolean
  addButtonText?: string
  showActions?: boolean
  showViewButton?: boolean
  showEditButton?: boolean
  showDeleteButton?: boolean
  showPagination?: boolean
  itemsPerPage?: number
}>(), {
  loading: false,
  loadingText: 'Yükleniyor...',
  emptyTitle: 'Veri bulunamadı',
  emptyDescription: 'Aradığınız kriterlere uygun veri bulunamadı.',
  showSearch: true,
  searchPlaceholder: 'Ara...',
  showAddButton: true,
  addButtonText: 'Yeni Ekle',
  showActions: true,
  showViewButton: true,
  showEditButton: true,
  showDeleteButton: true,
  showPagination: true,
  itemsPerPage: 10
})

// Emits
const emit = defineEmits<{
  add: []
  view: [item: Item]
  edit: [item: Item]
  delete: [item: Item]
  'update:search': [query: string]
  'update:sort': [field: string, direction: 'asc' | 'desc']
  'update:page': [page: number]
}>()

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const sortBy = ref('')
const sortDirection = ref<'asc' | 'desc'>('asc')

// Computed
const filteredItems = computed(() => {
  let items = props.items

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(item =>
      Object.values(item).some(value =>
        String(value).toLowerCase().includes(query)
      )
    )
  }

  // Sort
  if (sortBy.value) {
    items = [...items].sort((a, b) => {
      const aValue = getItemValue(a, sortBy.value)
      const bValue = getItemValue(b, sortBy.value)
      
      if (aValue < bValue) return sortDirection.value === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection.value === 'asc' ? 1 : -1
      return 0
    })
  }

  return items
})

const totalPages = computed(() => {
  return Math.ceil(filteredItems.value.length / props.itemsPerPage)
})

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredItems.value.slice(start, end)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage + 1
  const end = Math.min(currentPage.value * props.itemsPerPage, filteredItems.value.length)
  return `${start}-${end} / ${filteredItems.value.length} kayıt`
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Methods
const getItemValue = (item: Item, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item) || ''
}

const formatDate = (date: string | Date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortDirection.value = 'asc'
  }
  emit('update:sort', field, sortDirection.value)
}

// Watchers
watch(searchQuery, (newQuery) => {
  currentPage.value = 1
  emit('update:search', newQuery)
})

watch(currentPage, (newPage) => {
  emit('update:page', newPage)
})
</script>

<style scoped>
.datatable-wrapper {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

.datatable-header {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 border-b border-gray-200;
}

.datatable-title-section {
  @apply mb-4 sm:mb-0;
}

.datatable-title {
  @apply text-lg font-semibold text-gray-900;
}

.datatable-description {
  @apply mt-1 text-sm text-gray-600;
}

.datatable-actions {
  @apply flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4;
}

.datatable-search {
  @apply relative;
}

.datatable-search-input {
  @apply w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm;
}

.datatable-search-icon {
  @apply absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none;
}

.datatable-add-button {
  @apply inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2;
}

.datatable-table-section {
  @apply relative;
}

.datatable-loading {
  @apply flex flex-col items-center justify-center py-12;
}

.datatable-loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600;
}

.datatable-loading-text {
  @apply mt-2 text-sm text-gray-600;
}

.datatable-empty {
  @apply text-center py-12;
}

.datatable-empty-icon {
  @apply mx-auto h-12 w-12 text-gray-400;
}

.datatable-empty-title {
  @apply mt-2 text-sm font-medium text-gray-900;
}

.datatable-empty-description {
  @apply mt-1 text-sm text-gray-500;
}

.datatable-empty-button {
  @apply mt-6 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.datatable-table-container {
  @apply overflow-hidden;
}

.datatable-table-wrapper {
  @apply overflow-x-auto;
}

.datatable-table {
  @apply min-w-full divide-y divide-gray-200;
}

.datatable-thead {
  @apply bg-gray-50;
}

.datatable-th {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.datatable-th-sortable {
  @apply cursor-pointer hover:bg-gray-100;
}

.datatable-th-content {
  @apply flex items-center space-x-1;
}

.datatable-sort-icon {
  @apply h-4 w-4 text-gray-400;
}

.datatable-sort-active {
  @apply text-indigo-600;
}

.datatable-th-actions {
  @apply relative py-3.5 pl-3 pr-4 sm:pr-6;
}

.datatable-tbody {
  @apply bg-white divide-y divide-gray-200;
}

.datatable-tr {
  @apply hover:bg-gray-50;
}

.datatable-td {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}

.datatable-td-actions {
  @apply text-right text-sm font-medium;
}

.datatable-actions-group {
  @apply flex items-center justify-end space-x-3;
}

.datatable-action-button {
  @apply text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.datatable-action-view {
  @apply text-indigo-600 hover:text-indigo-900;
}

.datatable-action-edit {
  @apply text-indigo-600 hover:text-indigo-900;
}

.datatable-action-delete {
  @apply text-red-600 hover:text-red-900;
}

.datatable-status-chip {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.datatable-status-active {
  @apply bg-green-100 text-green-800;
}

.datatable-status-inactive {
  @apply bg-red-100 text-red-800;
}

.datatable-status-pending {
  @apply bg-yellow-100 text-yellow-800;
}

.datatable-pagination {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3 border-t border-gray-200;
}

.datatable-pagination-info {
  @apply mb-4 sm:mb-0;
}

.datatable-pagination-text {
  @apply text-sm text-gray-700;
}

.datatable-pagination-controls {
  @apply flex items-center space-x-2;
}

.datatable-pagination-button {
  @apply inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.datatable-pagination-button-disabled {
  @apply opacity-50 cursor-not-allowed;
}

.datatable-pagination-pages {
  @apply flex items-center space-x-1;
}

.datatable-pagination-page {
  @apply inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500;
}

.datatable-pagination-page-active {
  @apply bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700;
}
</style>
