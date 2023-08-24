import { ref } from 'vue'
import {
  isDocumentDefined,
  isUndefined,
  isWindowDefined,
  noop,
} from '../utils/shared'

const isOnline = ref(true) // 网络是否可用
const isVisible = ref(true) // 页面是否可见

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
