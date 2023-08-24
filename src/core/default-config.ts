import type { FullConfiguration } from '../types'

export const defaultConfig: FullConfiguration<any, any> = {
  errorRetryCount: 0,
  errorRetryInterval: 5 * 1000,
  shouldRetryOnError: true,
  loadingTimeout: 3 * 1000,
  dedupingInterval: 2 * 1000,
  immediate: true,
  refreshInterval: 0,
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  revalidateOnMount: false,
  focusThrottleInterval: 5 * 1000,

  fetcher: (...args: Parameters<typeof fetch>) =>
    fetch(...args).then((r) => r.json()),

  cache: new Map<string, any>(),
}
