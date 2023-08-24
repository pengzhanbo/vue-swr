/**
 * 预请求，根据 key 值 预先请求数据并缓存
 * 后续相同 key 的请求将直接使用 预加载缓存
 */
import type {
  Fetcher,
  FetcherResponse,
  FullConfiguration,
  GlobalState,
  KeyRef,
} from '../types'
import { globalCache, initCache } from './cache'
import { resolveArgs } from './resolve-arg'
import { serialize } from './serialize'

function preload<Data = unknown, Error = unknown, Key extends KeyRef = KeyRef>(
  keyRef: Key,
  fetcher: Fetcher<Data>,
  config: FullConfiguration<Data, Error, Fetcher<Data>>,
) {
  const { cache } = config
  const { PRELOAD } = globalCache.get(cache)! as GlobalState<Data>
  const [key, fnArg] = serialize(keyRef)

  if (PRELOAD[key]) return PRELOAD[key]
  return (PRELOAD[key] = fetcher(fnArg))
}

function useSWRPreload<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  key: Key,
): FetcherResponse<Data>
function useSWRPreload<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  key: Key,
  fetcher: Fetcher<Data, Key>,
): FetcherResponse<Data>
function useSWRPreload<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  ...arg: any[]
): FetcherResponse<Data> {
  const [key, fetcher, config] = resolveArgs<Data, Error, Key>(...arg)
  initCache(config.cache)
  return preload(key, fetcher, config)
}

export default useSWRPreload
