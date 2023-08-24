import type { Cache, GlobalState } from '../types'
import { isUndefined, timestamp } from '../utils/shared'

export const globalCache = new WeakMap<Cache<any>, GlobalState>()
;(window as any).globalCache = globalCache

export const createCacheHelper = <Data = unknown>(
  cache: Cache<[Data, number]>,
  key: string,
): readonly [
  (value: Data) => void, // setter
  () => [Data, number] | undefined, // getter
  () => void, // delete
] => {
  const getCache = () => cache.get(key)
  const setCache = (value: Data) =>
    value !== null &&
    !isUndefined(value) &&
    cache.set(key, [value, timestamp()])
  const deleteCache = () => cache.delete(key)

  return [setCache, getCache, deleteCache]
}

export const initCache = (cache: Cache<any>) => {
  if (!globalCache.has(cache)) {
    globalCache.set(cache, {
      FETCH: {},
      PRELOAD: {},
      DEDUPE: {},
    } as GlobalState)
  }
}
