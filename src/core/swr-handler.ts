import { computed, ref, shallowRef, watch } from 'vue'
import type {
  Fetcher,
  FullConfiguration,
  GlobalState,
  KeyRef,
  SWRResponse,
} from '../types'
import { isUndefined, timestamp } from '../utils/shared'
import { tryOnMounted } from '../utils/tryOnMounted'
import { tryOnScopeDispose } from '../utils/tryOnScopeDispose'
import { createCacheHelper, globalCache } from './cache'
import { isOnline, isVisible } from './preset'
import { serialize } from './serialize'

function useSWRHandler<
  Data = unknown,
  Error = unknown,
  Key extends KeyRef = KeyRef,
>(
  keyRef: Key,
  fetcher: Fetcher<Data>,
  config: FullConfiguration<Data, Error, Fetcher<Data>>,
): SWRResponse<Data, Error> {
  const {
    cache,
    shouldRetryOnError,
    errorRetryInterval,
    errorRetryCount,
    loadingTimeout,
    dedupingInterval,
    immediate,
    fallbackData,
    onSuccess,
    onError,
    onErrorRetry,
    onLoadSlow,
  } = config

  const { FETCH, PRELOAD, DEDUPE } = globalCache.get(
    cache,
  )! as GlobalState<Data>
  const [key, fnArg] = serialize(keyRef)

  const fallback = () => (isUndefined(fallbackData) ? null : fallbackData)
  const [setCache, getCache, deleteCache] = createCacheHelper<Data>(cache, key)

  const isLoading = ref(false)
  const data = shallowRef<Data | null>(fallback())
  const error = shallowRef<Error | null>(null)

  const isActive = computed(() => isOnline.value && isVisible.value)

  // 如果传入的 key值为 null或者undefined，则不触发请求，返回默认的数据
  if (isUndefined(key) || key === null)
    return {
      isLoading,
      data,
      error,
      trigger: () => Promise.resolve({ isLoading, data, error }),
    }

  let retryCount = 0

  // 删除缓存
  // 检查数据使用者的期望数据保鲜时间，
  // 根据最大保鲜时间，与当前时间进行比较，如果当前时间大于最大保鲜时间，则删除缓存
  const cleanupCache = () => {
    if (!DEDUPE[key]) {
      DEDUPE[key] = [
        setTimeout(() => {
          deleteCache()
          delete DEDUPE[key]
        }, dedupingInterval),
        dedupingInterval,
        timestamp(),
      ]
    }
    const [timer, interval, createAt] = DEDUPE[key]
    if (interval >= dedupingInterval) return
    clearTimeout(timer)
    DEDUPE[key] = [
      setTimeout(
        () => {
          deleteCache()
          delete DEDUPE[key]
        },
        dedupingInterval - (timestamp() - createAt),
      ),
      dedupingInterval,
      createAt,
    ]
  }

  let loadingTimer: NodeJS.Timeout | null = null

  const revalidate = async () => {
    const cached = getCache()
    // 如果存在数据缓存，检查缓存是否过期
    // 缓存有效则不再发起请求，直接返回缓存数据
    if (!isUndefined(cached)) {
      const [value, createAt] = cached
      cleanupCache()
      if (createAt + dedupingInterval >= timestamp()) {
        data.value = value
        error.value = null
        isLoading.value = true
        return
      }
    }

    // 检查是否有相同的请求，如果有则不再发起请求，复用当前请求
    if (!FETCH[key]) {
      const preload = PRELOAD[key]
      FETCH[key] = preload
        ? [preload, timestamp()]
        : [fetcher(fnArg), timestamp()]
    }
    const [promise, createAt] = FETCH[key]

    // 在请求过程中，如果再次调用 revalidate 方法则不再发起请求
    if (isLoading.value) {
      await promise
      return
    }

    // 如果请求时间过长，则触发 onLoadSlow 回调
    // todo 是否将 请求时间过长认为是一种 错误处理？
    let isTimeout = false
    loadingTimer =
      loadingTimeout > 0 && !loadingTimer
        ? setTimeout(() => {
            isTimeout = true
            isLoading.value = false
            onLoadSlow?.(key, config)
          }, loadingTimeout)
        : null

    let shouldRetry = false

    try {
      isLoading.value = true
      error.value = null
      const res = await promise
      data.value = res
      isLoading.value = false
      setCache(res)
      onSuccess?.(res, key, config)
      retryCount = 0
      loadingTimer && clearTimeout(loadingTimer)
    } catch (e: any) {
      if (!isTimeout) {
        error.value = e
        data.value = fallback()
        isLoading.value = false
        onError?.(e, key, config)
        if (shouldRetryOnError) {
          retryCount += 1
          if (
            retryCount <= errorRetryCount &&
            timestamp() - createAt < errorRetryInterval
          ) {
            shouldRetry = true
            onErrorRetry?.(e, key, config, retryCount)
          }
        }
      }
    } finally {
      // 完成的请求，则删除缓存和预加载缓存
      delete FETCH[key]
      delete PRELOAD[key]
    }
    if (shouldRetry) {
      await revalidate()
    } else {
      isLoading.value = false
    }
  }

  // Watch for online/offline
  // Watch visible/hidden
  let focusTimer: NodeJS.Timeout | null = null
  const unfocusWatch = watch(
    () => [isOnline.value, isVisible.value],
    ([online, visible], [oldOnline, oldVisible]) => {
      const active =
        (online && oldOnline !== online && config.revalidateOnReconnect) ||
        (visible && oldVisible !== visible && config.revalidateOnFocus)
      if (active && !isLoading.value && !focusTimer) {
        revalidate()
        focusTimer = setTimeout(() => {
          focusTimer && clearTimeout(focusTimer)
          focusTimer = null
        }, config.focusThrottleInterval)
      }
    },
  )

  tryOnScopeDispose(() => unfocusWatch())

  // revalidate on mounted
  tryOnMounted(() => config.revalidateOnMount && revalidate())

  const result = { isLoading, data, error }

  // polling 自动轮询请求更新数据
  let pollingTimer: NodeJS.Timeout | null = null
  const pollingRevalidate = () => {
    if (config.refreshInterval > 0) {
      pollingTimer && clearTimeout(pollingTimer)
      pollingTimer = setTimeout(() => {
        isActive.value && revalidate()
        pollingRevalidate()
      }, config.refreshInterval)
    }
  }
  tryOnScopeDispose(() => pollingTimer && clearTimeout(pollingTimer))

  // 立即发起请求
  if (immediate) {
    revalidate()
    pollingRevalidate()
  }

  return {
    ...result,
    trigger: async () => {
      await revalidate()
      pollingRevalidate()
      return result
    },
  }
}

export default useSWRHandler
