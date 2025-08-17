<template>
  <div class="datatable-wrapper">
    <!-- Genel Arama -->
    <div class="datatable-search">
      <input
        v-model.trim="generalSearch"
        class="datatable-search-input"
        placeholder="Search..."
        type="text"
      />
    </div>
    <div class="datatable-scroll">
      <table class="datatable-table">
        <thead>
          <tr>
            <th v-for="field in fields" :key="field.value" class="datatable-th">
              {{ field.label }}
            </th>
            <th v-if="actions" class="datatable-th"></th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in filteredItems"
            :key="index"
            class="datatable-tr"
          >
            <td v-for="field in fields" :key="field.value" class="datatable-td">
              <!-- Rol için renkli chip -->
              <template v-if="field.value === 'role'">
                <span class="datatable-chip datatable-chip-role">
                  <span v-if="item.roleIcon" :class="['datatable-role-icon', item.roleIcon]" />
                  {{ item[field.value] }}
                </span>
              </template>
              <!-- Durum için renkli chip -->
              <template v-else-if="field.value === 'status'">
                <span :class="['datatable-chip', statusClass(item.status)]">
                  {{ item.status }}
                </span>
              </template>
              <!-- Diğer alanlar -->
              <template v-else>
                {{ item[field.value] }}
              </template>
            </td>
            <td v-if="actions" class="datatable-td datatable-actions">
              <span
                v-for="action in filteredActions(actions, item)"
                :key="action.key"
                class="datatable-action"
                @click="actionTrigger(action.value, item)"
                :title="tooltipRename(action.value)"
              >
                <img :src="`/${action.value}.svg`" :alt="action.value" />
              </span>
            </td>
          </tr>
          <tr v-if="filteredItems.length === 0">
            <td :colspan="fields.length + (actions ? 1 : 0)" class="datatable-empty">
              No data found.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Sayfalama -->
    <div v-if="pageSize < filteredItems.length" class="datatable-pagination">
      <button
        class="datatable-pagination-btn"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Prev
      </button>
      <span class="datatable-pagination-info">
        Page {{ currentPage }} / {{ totalPages }}
      </span>
      <button
        class="datatable-pagination-btn"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dateFormat } from '~/utils/datesFormat'
import { computed, ref } from 'vue'

interface Field {
  label: string
  value: string
  title?: boolean
  link?: string
  type?: string
}

interface Item {
  [key: string]: any
}

interface Action {
  [key: string]: string
}

// Props Emits
const props = defineProps({
  items: {
    type: Array as () => Item[],
    required: true,
  },
  fields: {
    type: Array as () => Field[],
    required: true,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  actions: {
    type: Array as () => Action[],
  },
})

const currentPage = ref(1)
const generalSearch = ref('')

const filteredActions = (actions: Array<any>, item: any) => {
  if (!actions) return []
  return actions
}

const tooltipRename = (e: string) => {
  switch (e) {
    case 'edit': return 'Edit'
    case 'delete': return 'Delete'
    case 'view': return 'View'
    default: return e
  }
}

function actionTrigger(e: string, item: any) {
  // Emit veya başka bir işlem yapılabilir
}

function statusClass(status: string) {
  switch (status?.toLowerCase()) {
    case 'active': return 'datatable-chip-active'
    case 'pending': return 'datatable-chip-pending'
    case 'inactive': return 'datatable-chip-inactive'
    default: return ''
  }
}

const filteredItems = computed(() => {
  let items = props.items
  if (generalSearch.value) {
    const search = generalSearch.value.toLowerCase()
    items = items.filter(item =>
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(search)
      )
    )
  }
  // Sayfalama
  const start = (currentPage.value - 1) * props.pageSize
  return items.slice(start, start + props.pageSize)
})

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.pageSize)
})
</script>

<style scoped>
.datatable-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 24px;
  margin: 0 auto;
  max-width: 100vw;
}
.datatable-search {
  margin-bottom: 16px;
}
.datatable-search-input {
  width: 240px;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
}
.datatable-scroll {
  overflow-x: auto;
}
.datatable-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}
.datatable-th {
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #6b7280;
  background: #f9fafb;
  font-size: 13px;
  border-bottom: 1px solid #e5e7eb;
}
.datatable-tr {
  background: #fff;
  transition: background 0.2s;
}
.datatable-tr:hover {
  background: #f3f4f6;
}
.datatable-td {
  padding: 12px 16px;
  font-size: 15px;
  color: #374151;
  border-bottom: 1px solid #f1f1f1;
}
.datatable-chip {
  display: inline-block;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
}
.datatable-chip-role {
  background: #f3f4f6;
  color: #6366f1;
}
.datatable-chip-active {
  background: #d1fae5;
  color: #059669;
}
.datatable-chip-pending {
  background: #fef3c7;
  color: #f59e42;
}
.datatable-chip-inactive {
  background: #e5e7eb;
  color: #6b7280;
}
.datatable-actions {
  text-align: right;
}
.datatable-action {
  display: inline-block;
  margin-left: 8px;
  cursor: pointer;
}
.datatable-empty {
  text-align: center;
  color: #9ca3af;
  padding: 32px 0;
  font-size: 16px;
}
.datatable-pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
  gap: 12px;
}
.datatable-pagination-btn {
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.datatable-pagination-btn:disabled {
  background: #e5e7eb;
  color: #9ca3af;
  cursor: not-allowed;
}
.datatable-pagination-info {
  font-size: 14px;
  color: #6b7280;
}
</style>
