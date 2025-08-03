<template>
  <div class="responsive-table">
    <!-- Desktop Table -->
    <v-card v-if="!isMobile" class="data-table">
      <v-card-title v-if="title" class="d-flex align-center">
        <v-icon v-if="icon" class="me-2">{{ icon }}</v-icon>
        {{ title }}
        <v-spacer />
        <slot name="title-actions" />
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="items"
        :loading="loading"
        :items-per-page="itemsPerPage"
        :search="search"
        :sort-by="sortBy"
        class="elevation-0"
      >
        <!-- Custom slots -->
        <template v-for="(_, name) in $slots" #[name]="slotData">
          <slot :name="name" v-bind="slotData" />
        </template>
      </v-data-table>
    </v-card>

    <!-- Mobile Cards -->
    <div v-else class="mobile-cards">
      <div v-if="title" class="mobile-header d-flex align-center mb-4">
        <v-icon v-if="icon" class="me-2">{{ icon }}</v-icon>
        <h3 class="text-h6">{{ title }}</h3>
        <v-spacer />
        <slot name="title-actions" />
      </div>

      <!-- Search bar for mobile -->
      <v-text-field
        v-if="showSearch"
        v-model="search"
        label="Search..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        class="mb-4"
        hide-details
      />

      <!-- Loading state -->
      <div v-if="loading" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Mobile item cards -->
      <div v-else-if="items.length" class="d-flex flex-column gap-3">
        <v-card
          v-for="(item, index) in paginatedItems"
          :key="index"
          variant="outlined"
          class="mobile-item-card"
        >
          <v-card-text>
            <slot name="mobile-item" :item="item" :index="index">
              <!-- Default mobile layout -->
              <div v-for="header in visibleHeaders" :key="header.key" class="mb-2">
                <div class="text-caption text-grey-600 font-weight-medium">
                  {{ header.title }}
                </div>
                <div class="text-body-2">
                  {{ getItemValue(item, header.key) }}
                </div>
              </div>
            </slot>
          </v-card-text>
          
          <v-card-actions v-if="$slots['item.actions']">
            <slot name="item.actions" :item="item" :index="index" />
          </v-card-actions>
        </v-card>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-8">
        <v-icon size="64" color="grey-400" class="mb-4">
          mdi-inbox-outline
        </v-icon>
        <p class="text-body-1 text-grey-600">No data available</p>
      </div>

      <!-- Mobile pagination -->
      <div v-if="items.length > itemsPerPage" class="d-flex justify-center mt-4">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="5"
          size="small"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TableHeader } from '~/types'

// Props
const props = withDefaults(defineProps<{
  title?: string
  icon?: string
  headers: TableHeader[]
  items: any[]
  loading?: boolean
  itemsPerPage?: number
  search?: string
  sortBy?: any[]
  showSearch?: boolean
  mobileVisibleFields?: string[]
}>(), {
  loading: false,
  itemsPerPage: 10,
  search: '',
  sortBy: () => [],
  showSearch: true,
  mobileVisibleFields: () => []
})

// Composables
const { isMobile } = useDisplay()

// Reactive data
const currentPage = ref(1)

// Computed
const visibleHeaders = computed(() => {
  if (!isMobile.value) return props.headers
  
  if (props.mobileVisibleFields.length) {
    return props.headers.filter(header => 
      props.mobileVisibleFields.includes(header.key)
    )
  }
  
  // Show first 3-4 most important fields on mobile
  return props.headers.slice(0, 4).filter(header => header.key !== 'actions')
})

const paginatedItems = computed(() => {
  if (!isMobile.value) return props.items
  
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return props.items.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.itemsPerPage)
})

// Methods
const getItemValue = (item: any, key: string) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item) || '-'
}
</script>

<style scoped>
.mobile-cards {
  width: 100%;
}

.mobile-item-card {
  transition: transform 0.2s ease-in-out;
}

.mobile-item-card:hover {
  transform: translateY(-1px);
}

.gap-3 {
  gap: 0.75rem;
}
</style> 