import { useToast as useVueToastification } from 'vue-toastification'

export const useToast = () => {
  const toast = useVueToastification()

  const success = (message: string) => {
    return toast.success(message, {
      timeout: 4000,
      position: 'top-right',
      closeOnClick: true,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      icon: 'mdi-check-circle',
      toastClassName: 'custom-success-toast',
      hideProgressBar: true
    })
  }

  const error = (message: string) => {
    return toast.error(message, {
      timeout: 4000,
      position: 'top-right',
      closeOnClick: true,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      icon: 'mdi-alert-circle',
      toastClassName: 'custom-error-toast',
      hideProgressBar: true
    })
  }

  const warning = (message: string) => {
    return toast.warning(message, {
      timeout: 4000,
      position: 'top-right',
      closeOnClick: true,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      icon: 'mdi-alert',
      toastClassName: 'custom-warning-toast',
      hideProgressBar: true
    })
  }

  const info = (message: string) => {
    return toast.info(message, {
      timeout: 4000,
      position: 'top-right',
      closeOnClick: true,
      pauseOnFocusLoss: false,
      pauseOnHover: false,
      draggable: false,
      icon: 'mdi-information',
      toastClassName: 'custom-info-toast',
      hideProgressBar: true
    })
  }

  const dismissAll = () => {
    toast.clear()
  }

  return {
    success,
    error,
    warning,
    info,
    dismissAll
  }
} 