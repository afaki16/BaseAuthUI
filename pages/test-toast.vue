<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold mb-6">Toast Test</h1>
    
    <div class="space-y-4">
      <button 
        @click="showSuccess" 
        class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
      >
        Success Toast
      </button>
      
      <button 
        @click="showError" 
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Error Toast
      </button>
      
      <button 
        @click="showWarning" 
        class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
      >
        Warning Toast
      </button>
      
      <button 
        @click="showInfo" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Info Toast
      </button>
    </div>
  </div>
</template>

<script setup>
const { success, error, warning, info } = useToast()

const showSuccess = () => {
  success('This is a success message!')
}

const showError = () => {
  error('This is an error message!')
}

const showWarning = () => {
  warning('This is a warning message!')
}

const showInfo = () => {
  info('This is an info message!')
}
</script>
