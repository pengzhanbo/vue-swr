import { ref } from 'vue'
import {
  isDocumentDefined,
  isUndefined,
  isWindowDefined,
  noop,
} from '../utils/shared'

const isOnline = ref(true)
const isVisible = ref(true)

const [onWindowEvent, offWindowEvent] =
  isWindowDefined && window.addEventListener
    ? [window.addEventListener, window.removeEventListener]
    : [noop, noop]

const onOnline = () => (isOnline.value = true)
const onOffline = () => (isOnline.value = false)

const onVisibilitychange = () => {
  const visibilityState = isDocumentDefined && document.visibilityState
  isVisible.value = isUndefined(visibilityState) || visibilityState !== 'hidden'
}

onWindowEvent('online', onOnline)
onWindowEvent('offline', onOffline)

onWindowEvent('visibilitychange', onVisibilitychange)

const cleanupPreset = () => {
  offWindowEvent('online', onOnline)
  offWindowEvent('offline', onOffline)
  offWindowEvent('visibilitychange', onVisibilitychange)
}

export { isOnline, isVisible, cleanupPreset }
