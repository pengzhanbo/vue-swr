import { getCurrentInstance, onMounted } from 'vue'

export const tryOnMounted = (fn: () => void): boolean => {
  const instance = getCurrentInstance()
  if (instance) {
    onMounted(fn)
    return true
  }
  return false
}
