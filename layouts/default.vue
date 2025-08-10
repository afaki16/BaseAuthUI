<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" :class="{ '-translate-x-full': !isSidebarOpen }">
      <div class="flex items-center justify-center h-16 border-b">
        <img src="/images/tooth-icon.svg" class="w-8 h-8 text-indigo-600" alt="Logo" />
        <span class="ml-2 text-xl font-semibold text-gray-800">BaseAuth</span>
      </div>
      
      <nav class="mt-5 px-2">
       <NuxtLink to="/" class="group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path === '/' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:home" class="mr-3 h-6 w-6" />
      Ana Sayfa
    </NuxtLink>

        <NuxtLink to="/patients" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/patients') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:account-group" class="mr-3 h-6 w-6"  />
      Hastalar
    </NuxtLink>

        <NuxtLink to="/treatments" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/treatments') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:medical-bag" class="mr-3 h-6 w-6" />
      Tedaviler
    </NuxtLink>

         <NuxtLink to="/appointments" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/appointments') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:calendar-clock" class="mr-3 h-6 w-6" />
      Randevular
    </NuxtLink>
      <NuxtLink to="/doctors" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/doctors') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
    <Icon name="mdi:doctor" class="mr-3 h-6 w-6" />
    Doktorlar
  </NuxtLink>
        <NuxtLink to="/tooth" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/tooth') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:tooth" class="mr-3 h-6 w-6"  />
      Dişler
    </NuxtLink>
     <NuxtLink to="/teeth" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/teeth') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:toothbrush" class="mr-3 h-6 w-6"  />
      Dişler Alternatif
    </NuxtLink>
      <NuxtLink to="/calendars" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/calendars') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
      <Icon name="mdi:calendar-edit" class="mr-3 h-6 w-6" />
      Randevular Alternatif
    </NuxtLink>
     <NuxtLink to="/dentists" class="mt-1 group flex items-center px-2 py-2 text-base font-medium rounded-md" :class="[$route.path.startsWith('/dentists') ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900']">
    <Icon name="mdi:toothbrush-paste" class="mr-3 h-6 w-6" />
    Dişçiler Alternatif
  </NuxtLink>
      </nav>
    </aside>

    <!-- Main content -->
    <div class="flex flex-col min-h-screen transition-all duration-300" :class="{ 'pl-64': isSidebarOpen, 'pl-0': !isSidebarOpen }">
      <!-- Top navbar -->
      <header class="fixed top-0 right-0 left-0 bg-white shadow-sm z-10" :class="{ 'left-64': isSidebarOpen, 'left-0': !isSidebarOpen }">
        <div class="flex items-center justify-between h-16 px-4">
          <div class="flex items-center">
            <div class="flex items-center">
              <img src="/images/tooth-icon.svg" class="w-8 h-8 text-indigo-600" alt="Logo" />
              <span class="ml-2 text-xl font-semibold text-gray-800">BaseAuth</span>
            </div>
            <v-btn icon @click="toggleSidebar" class="ml-4">
              <v-icon>mdi-menu</v-icon>
            </v-btn>
          </div>
          
          <div class="flex items-center space-x-4">
            <LanguageSelector class="mr-4" />
            <v-btn
              @click="logout"
              variant="text"
              class="text-gray-600 hover:text-gray-900"
            >
              <v-icon start>mdi-logout</v-icon>
              <span>Çıkış Yap</span>
            </v-btn>
          </div>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 p-6 mt-16">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
const isSidebarOpen = ref(true)
const auth = useAuthStore()
const router = useRouter()

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const logout = async () => {
  try {
    await auth.logout()
    router.push('/login')
  } catch (error) {
    console.error('Çıkış yapılırken bir hata oluştu:', error)
  }
}
</script> 