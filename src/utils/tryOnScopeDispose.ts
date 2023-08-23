import { getCurrentScope, onScopeDispose } from 'vue'

export const tryOnScopeDispose = (fn: () => void): boolean => {
  const scope = getCurrentScope()
  if (scope) {
    onScopeDispose(fn)
    return true
  }
  return false
}
