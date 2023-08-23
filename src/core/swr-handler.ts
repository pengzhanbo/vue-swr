import { ref, shallowRef } from 'vue'
import type {
  Fetcher,
  FullConfiguration,
  GlobalState,
  KeyRef,
  SWRResponse,
} from '../types'
import { isUndefined, timestamp } from '../utils/shared'
import { createCacheHelper, globalCache } from './cache'
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

  let retryCount = 0

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

  const revalidate = async () => {
    const cached = getCache()
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

    if (!FETCH[key]) {
      const preload = PRELOAD[key]
      FETCH[key] = preload
        ? [preload, timestamp()]
        : [fetcher(fnArg), timestamp()]
    }
    const [promise, createAt] = FETCH[key]

    let isTimeout = false
    const timer =
      loadingTimeout > 0
        ? setTimeout(() => {
            isTimeout = true
            onLoadSlow?.(key, config)
          }, loadingTimeout)
        : null
    let shouldRetry = false

    try {
      isLoading.value = true
      data.value = fallback()
      error.value = null
      const res = await promise
      data.value = res
      isLoading.value = false
      setCache(res)
      onSuccess?.(res, key, config)
      retryCount = 0
      timer && clearTimeout(timer)
    } catch (e: any) {
      if (!isTimeout) {
        error.value = e
        data.value = null
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
      delete FETCH[key]
      delete PRELOAD[key]
    }
    shouldRetry && (await revalidate())
  }

  if (immediate) revalidate()

  const result = { isLoading, data, error }

  return {
    ...result,
    trigger: async () => {
      await revalidate()
      return result
    },
  }
}

export default useSWRHandler
