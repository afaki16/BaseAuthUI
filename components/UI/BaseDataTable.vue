<template>
        <div class="sm:flex sm:items-center">
      <div class="sm:flex-auto">
       
      </div>
      <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-4">
        <!-- Arama Çubuğu -->
        <div class="relative">
          <input
                type="text"
                v-model="searchQuery"
                :placeholder="searchPlaceholder"
                class="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                @input="handleSearch"
              />
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <button
        v-if="showAddButton"  
            type="button"
           @click="$emit('add')"
            class="add-button"
        >
         <svg class="add-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ addButtonText }}
        </button>
      </div>
    </div>
       
      
        <div class="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-4">
        <!-- Search Bar -->
  
        
        </div>
        
  <div class="base-data-table">
      
     
     <v-toolbar flat class="toolbar-section gradient-toolbar">
      <v-toolbar-title class="gradient-title">
        <v-icon :icon="toolbarIcon" size="x-small" start class="gradient-icon"></v-icon>
        <span class="gradient-text">{{ title }}</span>
      </v-toolbar-title>
      
    </v-toolbar>
    <!-- Table Section -->
    <div class="table-container">
      <!-- Loading State -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p class="loading-text">{{ loadingText }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <svg class="empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3 class="empty-title">{{ emptyTitle }}</h3>
        <p class="empty-description">{{ emptyDescription }}</p>
        <button
          v-if="showAddButton"
          @click="$emit('add')"
          class="empty-add-button"
        >
          {{ addButtonText }}
        </button>
      </div>

      <!-- Data Table -->
      <div v-else class="table-wrapper">
        <div class="table-responsive">
          <table class="data-table">
            <thead class="table-header-row">
              <tr>
                <th
                  v-for="column in columns"
                  :key="column.key"
                  class="table-header-cell"
                  :class="{ 'sortable': column.sortable !== false }"
                  @click="column.sortable !== false ? handleSort(column.key) : null"
                >
                  <div class="header-cell-content">
                    <span class="header-text">{{ column.label }}</span>
                    <svg
                      v-if="column.sortable !== false"
                      class="sort-icon"
                      :class="{ 'sort-active': sortBy === column.key }"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                </th>
                <th v-if="showActions" class="table-header-cell actions-header">
                  <span class="sr-only">İşlemler</span>
                </th>
              </tr>
            </thead>
            <tbody class="table-body">
              <tr
                v-for="(item, index) in paginatedItems"
                :key="item.id || index"
                class="table-row"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  class="table-cell"
                >
                  <slot :name="`cell-${column.key}`" :item="item" :value="getNestedValue(item, column.key)">
                    <span class="cell-text">{{ getNestedValue(item, column.key) }}</span>
                  </slot>
                </td>
                <td v-if="showActions" class="table-cell actions-cell">
                  <div class="action-buttons">
                    <slot name="actions" :item="item">
                      <button
                        v-if="showViewButton"
                        @click="$emit('view', item)"
                        class="action-button view-button"
                        title="Görüntüle"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        v-if="showEditButton"
                        @click="$emit('edit', item)"
                        class="action-button edit-button"
                        title="Düzenle"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        v-if="showDeleteButton"
                        @click="$emit('delete', item)"
                        class="action-button delete-button"
                        title="Sil"
                      >
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

        <!-- Pagination -->
        <div v-if="showPagination && totalPages > 1" class="pagination">
          <div class="pagination-info">
            <span class="pagination-text">
              {{ paginationInfo }}
            </span>
          </div>
          <div class="pagination-controls">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="currentPage === 1"
              class="pagination-button"
              :class="{ 'disabled': currentPage === 1 }"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="pagination-button"
              :class="{ 'active': page === currentPage }"
            >
              {{ page }}
            </button>
            
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="currentPage === totalPages"
              class="pagination-button"
              :class="{ 'disabled': currentPage === totalPages }"
            >
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  // Data
  items: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  
  // Display options
  title: {
    type: String,
    default: 'Veri Tablosu'
  },
  description: {
    type: String,
    default: 'Tüm verilerin listesi ve detayları'
  },
  toolbarIcon: {
    type: String,
    default: 'mdi-account-multiple'
  },
  searchPlaceholder: {
    type: String,
    default: 'Ara...'
  },
  addButtonText: {
    type: String,
    default: 'Yeni Ekle'
  },
  
  // Loading and empty states
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Yükleniyor...'
  },
  emptyTitle: {
    type: String,
    default: 'Veri bulunamadı'
  },
  emptyDescription: {
    type: String,
    default: 'Henüz hiç veri eklenmemiş.'
  },
  
  // Visibility controls
  showAddButton: {
    type: Boolean,
    default: true
  },
  showSearch: {
    type: Boolean,
    default: true
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showViewButton: {
    type: Boolean,
    default: true
  },
  showEditButton: {
    type: Boolean,
    default: true
  },
  showDeleteButton: {
    type: Boolean,
    default: true
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  
  // Pagination
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits(['add', 'view', 'edit', 'delete', 'search', 'sort'])

// Reactive data
const searchQuery = ref('')
const sortBy = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)

// Computed properties
const filteredItems = computed(() => {
  let filtered = [...props.items]
  
  // Search filtering
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => {
      return props.columns.some(column => {
        const value = getNestedValue(item, column.key)
        return value && value.toString().toLowerCase().includes(query)
      })
    })
  }
  
  // Sorting
  if (sortBy.value) {
    filtered.sort((a, b) => {
      const aValue = getNestedValue(a, sortBy.value)
      const bValue = getNestedValue(b, sortBy.value)
      
      if (aValue === bValue) return 0
      
      const comparison = aValue < bValue ? -1 : 1
      return sortOrder.value === 'asc' ? comparison : -comparison
    })
  }
  
  return filtered
})

const totalItems = computed(() => filteredItems.value.length)
const totalPages = computed(() => Math.ceil(totalItems.value / props.itemsPerPage))

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredItems.value.slice(start, end)
})

const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage + 1
  const end = Math.min(currentPage.value * props.itemsPerPage, totalItems.value)
  return `${start}-${end} / ${totalItems.value} kayıt`
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
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : ''
  }, obj)
}

const handleSearch = () => {
  currentPage.value = 1
  emit('search', searchQuery.value)
}

const handleSort = (key) => {
  if (sortBy.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = key
    sortOrder.value = 'asc'
  }
  
  currentPage.value = 1
  emit('sort', { key, order: sortOrder.value })
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Watch for items changes to reset pagination
watch(() => props.items, () => {
  currentPage.value = 1
})
</script>

<style scoped>
.base-data-table {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

/* Modern Gradient Icon */
.gradient-icon {
background: linear-gradient(135deg, #ffffff 0%, #2563eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 2px 4px rgba(79, 172, 254, 0.3));
}

/* Gradient Toolbar */
.gradient-toolbar {
background: linear-gradient(135deg, #ffffff 0%, #2563eb 100%);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.gradient-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gradient-text {
 background: linear-gradient(#2563eb);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 600;
  font-size: 1.125rem;
  filter: drop-shadow(0 1px 2px rgba(79, 172, 254, 0.2));
}

/* Header Section */
.table-header {
  @apply px-6 py-4 border-b border-gray-200 bg-blue-50;
}

.header-content {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4;
}

.header-left {
  @apply flex-1;
}

.page-title {
  @apply text-xl font-semibold text-gray-900 mb-1;
}

.page-description {
  @apply text-sm text-gray-600;
}

.header-right {
  @apply flex flex-col sm:flex-row items-stretch sm:items-center gap-3;
}

/* Search */
.search-container {
  @apply flex-1 sm:flex-none;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400;
}

.search-input {
  @apply w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors;
}

/* Add Button */
.add-button {
  @apply inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
}

.add-icon {
  @apply h-4 w-4 mr-2;
}

/* Table Container */
.table-container {
  @apply relative;
}

/* Loading State */
.loading-state {
  @apply flex flex-col items-center justify-center py-12;
}

.loading-spinner {
  @apply animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4;
}

.loading-text {
  @apply text-sm text-gray-600;
}

/* Empty State */
.empty-state {
  @apply flex flex-col items-center justify-center py-12;
}

.empty-icon {
  @apply h-12 w-12 text-gray-400 mb-4;
}

.empty-title {
  @apply text-lg font-medium text-gray-900 mb-2;
}

.empty-description {
  @apply text-sm text-gray-600 mb-4 text-center;
}

.empty-add-button {
  @apply inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
}

/* Table */
.table-wrapper {
  @apply overflow-hidden;
}

.table-responsive {
  @apply overflow-x-auto;
}

.data-table {
  @apply min-w-full divide-y divide-gray-200;
}

.table-header-row {
  @apply bg-gray-50;
}

.table-header-cell {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider;
}

.table-header-cell.sortable {
  @apply cursor-pointer hover:bg-gray-100 transition-colors;
}

.header-cell-content {
  @apply flex items-center gap-2;
}

.header-text {
  @apply flex-1;
}

.sort-icon {
  @apply h-4 w-4 text-gray-400 transition-transform;
}

.sort-icon.sort-active {
  @apply text-blue-600;
}

.actions-header {
  @apply text-right;
}

/* Table Body */
.table-body {
  @apply bg-white divide-y divide-gray-200;
}

.table-row {
  @apply hover:bg-gray-50 transition-colors;
}

.table-cell {
  @apply px-6 py-4 whitespace-nowrap text-sm text-gray-900;
}

.cell-text {
  @apply text-gray-900;
}

.actions-cell {
  @apply text-right;
}

/* Action Buttons */
.action-buttons {
  @apply flex items-center justify-end gap-2;
}

.action-button {
  @apply p-1.5 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.view-button {
  @apply text-blue-600 hover:bg-blue-50 focus:ring-blue-500;
}

.edit-button {
  @apply text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-500;
}

.delete-button {
  @apply text-red-600 hover:bg-red-50 focus:ring-red-500;
}

.action-button svg {
  @apply h-4 w-4;
}

/* Pagination */
.pagination {
  @apply flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4 border-t border-gray-200;
}

.pagination-info {
  @apply mb-4 sm:mb-0;
}

.pagination-text {
  @apply text-sm text-gray-700;
}

.pagination-controls {
  @apply flex items-center gap-1;
}

.pagination-button {
  @apply px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors;
}

.pagination-button.active {
  @apply text-blue-600 bg-blue-50 border-blue-500;
}

.pagination-button.disabled {
  @apply opacity-50 cursor-not-allowed hover:bg-white;
}

.pagination-button svg {
  @apply h-4 w-4;
}

/* Responsive Design */
@media (max-width: 640px) {
  .table-header-cell,
  .table-cell {
    @apply px-3 py-2;
  }
  
  .action-buttons {
    @apply flex-col gap-1;
  }
  
  .action-button {
    @apply p-1;
  }
  
  .action-button svg {
    @apply h-3 w-3;
  }
}

/* Screen reader only */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
