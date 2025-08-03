import { useToast as useVueToastification } from 'vue-toastification'

export const useToast = () => {
  const toast = useVueToastification()

  const success = (message: string) => {
    toast.success(message)
  }

  const error = (message: string) => {
    toast.error(message)
  }

  const warning = (message: string) => {
    toast.warning(message)
  }

  const info = (message: string) => {
    toast.info(message)
  }

  return {
    success,
    error,
    warning,
    info
  }
} 