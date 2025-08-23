# BaseDataTable Component

Modern ve responsive bir veri tablosu bileşeni. Filtreleme, sıralama, sayfalama ve arama özellikleri içerir.

## Özellikler

- ✅ Modern ve responsive tasarım
- ✅ Arama ve filtreleme
- ✅ Sütun bazında sıralama
- ✅ Sayfalama
- ✅ Özelleştirilebilir hücre render'ları
- ✅ Aksiyon butonları (görüntüle, düzenle, sil)
- ✅ Loading ve boş durum gösterimi
- ✅ Tailwind CSS ile stillendirilmiş

## Kullanım

### Temel Kullanım

```vue
<template>
  <BaseDataTable
    :items="data"
    :columns="columns"
    title="Veri Tablosu"
    description="Tüm verilerin listesi"
    @add="handleAdd"
    @view="handleView"
    @edit="handleEdit"
    @delete="handleDelete"
  />
</template>

<script setup>
const columns = [
  { key: 'name', label: 'Ad', sortable: true },
  { key: 'email', label: 'E-posta', sortable: true },
  { key: 'status', label: 'Durum', sortable: false }
]

const data = [
  { id: 1, name: 'Ahmet Yılmaz', email: 'ahmet@example.com', status: 'Aktif' },
  { id: 2, name: 'Ayşe Demir', email: 'ayse@example.com', status: 'Pasif' }
]
</script>
```

### Props

| Prop | Tip | Varsayılan | Açıklama |
|------|-----|------------|----------|
| `items` | Array | `[]` | Tablo verileri |
| `columns` | Array | `[]` | Sütun tanımları |
| `title` | String | `'Veri Tablosu'` | Tablo başlığı |
| `description` | String | `'Tüm verilerin listesi ve detayları'` | Tablo açıklaması |
| `searchPlaceholder` | String | `'Ara...'` | Arama kutusu placeholder'ı |
| `addButtonText` | String | `'Yeni Ekle'` | Ekle butonu metni |
| `loading` | Boolean | `false` | Yükleme durumu |
| `loadingText` | String | `'Yükleniyor...'` | Yükleme metni |
| `emptyTitle` | String | `'Veri bulunamadı'` | Boş durum başlığı |
| `emptyDescription` | String | `'Henüz hiç veri eklenmemiş.'` | Boş durum açıklaması |
| `showAddButton` | Boolean | `true` | Ekle butonunu göster |
| `showSearch` | Boolean | `true` | Arama kutusunu göster |
| `showActions` | Boolean | `true` | Aksiyon sütununu göster |
| `showViewButton` | Boolean | `true` | Görüntüle butonunu göster |
| `showEditButton` | Boolean | `true` | Düzenle butonunu göster |
| `showDeleteButton` | Boolean | `true` | Sil butonunu göster |
| `showPagination` | Boolean | `true` | Sayfalamayı göster |
| `itemsPerPage` | Number | `10` | Sayfa başına öğe sayısı |

### Events

| Event | Parametre | Açıklama |
|-------|-----------|----------|
| `add` | - | Yeni öğe ekleme |
| `view` | `item` | Öğe görüntüleme |
| `edit` | `item` | Öğe düzenleme |
| `delete` | `item` | Öğe silme |
| `search` | `query` | Arama sorgusu |
| `sort` | `{key, order}` | Sıralama bilgisi |

### Slots

#### Özel Hücre Render'ları

```vue
<template #cell-status="{ item, value }">
  <span class="px-2 py-1 rounded-full text-xs" :class="getStatusClass(value)">
    {{ value }}
  </span>
</template>
```

#### Özel Aksiyon Butonları

```vue
<template #actions="{ item }">
  <button @click="customAction(item)" class="action-button">
    Özel Aksiyon
  </button>
</template>
```

## Sütun Tanımları

```javascript
const columns = [
  {
    key: 'name',           // Veri anahtarı
    label: 'Ad',           // Görünen etiket
    sortable: true         // Sıralanabilir mi?
  }
]
```

## Örnekler

### Tam Özellikli Kullanım

```vue
<template>
  <BaseDataTable
    :items="permissions"
    :columns="tableColumns"
    title="İzinler"
    description="Tüm izinlerin listesi ve detayları"
    search-placeholder="İzin ara..."
    add-button-text="Yeni İzin Ekle"
    :loading="isLoading"
    loading-text="İzinler yükleniyor..."
    empty-title="İzin bulunamadı"
    empty-description="Henüz hiç izin tanımlanmamış."
    :show-add-button="true"
    :show-search="true"
    :show-actions="true"
    :show-view-button="true"
    :show-edit-button="true"
    :show-delete-button="true"
    :show-pagination="true"
    :items-per-page="10"
    @add="createPermission"
    @view="viewPermission"
    @edit="editPermission"
    @delete="deletePermission"
    @search="handleSearch"
    @sort="handleSort"
  >
    <!-- Özel hücre render'ları -->
    <template #cell-name="{ item, value }">
      <div class="flex items-center">
        <svg class="h-5 w-5 text-blue-600 mr-2">...</svg>
        <span class="font-medium">{{ value }}</span>
      </div>
    </template>

    <template #cell-status="{ item, value }">
      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="getStatusClass(value)">
        {{ value }}
      </span>
    </template>
  </BaseDataTable>
</template>
```

## Stil Özelleştirme

Component Tailwind CSS kullanır ve aşağıdaki CSS sınıfları ile özelleştirilebilir:

```css
/* Ana container */
.base-data-table {
  @apply bg-white rounded-lg shadow-sm border border-gray-200;
}

/* Tablo başlığı */
.table-header {
  @apply px-6 py-4 border-b border-gray-200;
}

/* Tablo satırları */
.table-row {
  @apply hover:bg-gray-50 transition-colors;
}

/* Aksiyon butonları */
.action-button {
  @apply p-1.5 rounded-md transition-colors;
}

.view-button {
  @apply text-blue-600 hover:bg-blue-50;
}

.edit-button {
  @apply text-yellow-600 hover:bg-yellow-50;
}

.delete-button {
  @apply text-red-600 hover:bg-red-50;
}
```
