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
             
             <!-- User Profile Dropdown -->
             <div class="relative">
               <button
                 @click="showUserMenu = !showUserMenu"
                 class="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
               >
                 <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                   <Icon name="mdi:account" class="w-4 h-4 text-white" />
                 </div>
                 <span class="truncate">{{ userInfo.name || 'Kullanıcı Adı' }}</span>
                 <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                 </svg>
               </button>

               <!-- Dropdown Menu -->
               <div
                 v-if="showUserMenu"
                 class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50"
               >
                 <div class="py-1">
                   <div class="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                     {{ userInfo.email }}
                   </div>
                   <button @click="handleProfileClick" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                     <Icon name="mdi:account-circle" class="mr-3 h-5 w-5" />
                     Profil
                   </button>
                   <button @click="handleSettingsClick" class="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                     <Icon name="mdi:cog" class="mr-3 h-5 w-5" />
                     Ayarlar
                   </button>
                   <div class="border-t border-gray-200 my-1"></div>
                   <button @click="logout" class="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                     <Icon name="mdi:logout" class="mr-3 h-5 w-5" />
                     Çıkış Yap
                   </button>
                 </div>
               </div>
             </div>
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
const showUserMenu = ref(false)
const auth = useAuthStore()
const router = useRouter()

// Kullanıcı bilgileri
const userInfo = ref({
  name: 'Dr. Ahmet Yılmaz',
  email: 'ahmet.yilmaz@dentbook.com'
})

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

// Kullanıcı menüsü işlemleri
const handleProfileClick = () => {
  showUserMenu.value = false
  // Profil sayfasına yönlendirme
  console.log('Profil sayfasına gidiliyor...')
}

const handleSettingsClick = () => {
  showUserMenu.value = false
  // Ayarlar sayfasına yönlendirme
  console.log('Ayarlar sayfasına gidiliyor...')
}

// Dışarı tıklandığında menüyü kapat
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.relative')) {
      showUserMenu.value = false
    }
  })
})
</script> 