<template>
  <div class="page-header mb-6">
    <div class="d-flex justify-space-between align-start">
      <div>
        <h1 class="text-h3 font-weight-bold text-grey-900 mb-2">
          {{ title }}
        </h1>
        
        <p v-if="description" class="text-body-1 text-grey-600 mb-4">
          {{ description }}
        </p>
        
        <!-- Breadcrumbs -->
        <v-breadcrumbs
          v-if="breadcrumbs.length"
          :items="breadcrumbs"
          class="pa-0"
        >
          <template #prepend>
            <v-icon size="small">mdi-home</v-icon>
          </template>
          
          <template #divider>
            <v-icon size="small">mdi-chevron-right</v-icon>
          </template>
        </v-breadcrumbs>
      </div>
      
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BreadcrumbItem } from '~/types'

// Props
const props = withDefaults(defineProps<{
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
}>(), {
  breadcrumbs: () => []
})
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.page-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

@media (max-width: 960px) {
  .page-header .d-flex {
    flex-direction: column;
    align-items: stretch !important;
  }
  
  .page-actions {
    margin-top: 1rem;
    justify-content: flex-start;
  }
}
</style> 