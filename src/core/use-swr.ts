import type { Fetcher, KeyRef, SWRConfiguration, SWRResponse } from '../types'
import { initCache } from './cache'
import { resolveArgs } from './resolve-arg'
import useSWRHandler from './swr-handler'

/**
 * @param key - 请求唯一标识 `{string|object|array|function|null}`，并作为 `fetcher` 的参数
 * @param fetcher - 请求函数 `() => Promise<Data>`
 * @param config - 配置
 * @example
 * ```ts
 * const { isLoading, data, error } = useSWR('/api/user')
 * const { isLoading, data, error } = useSWR(
 *  { url: '/api/article', query: { id: 1 } },
 *  ({ url, query }) => fetch(url, { params: query }).then((r) => r.json()),
 * )
 * const { isLoading, data, error } = useSWR(() => '/api/article')
 * const { isLoading, data, error } = useSWR(ref('/api/article'))
 * ```
 */
function useSWR<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  key: Key,
): SWRResponse<Data, Error>
function useSWR<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  key: Key,
  fetcher: Fetcher<Data, Key>,
): SWRResponse<Data, Error>
function useSWR<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  key: Key,
  config: SWRConfiguration<Data, Error, Fetcher<Data>>,
): SWRResponse<Data, Error>
function useSWR<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  key: Key,
  fetcher: Fetcher<Data, Key>,
  config: SWRConfiguration<Data, Error, Fetcher<Data>>,
): SWRResponse<Data, Error>
function useSWR<Data = any, Error = any, Key extends KeyRef = KeyRef>(
  ...arg: any[]
): SWRResponse<Data, Error> {
  const [key, fetcher, config] = resolveArgs<Data, Error, Key>(...arg)
  initCache(config.cache)
  return useSWRHandler(key, fetcher, config)
}

export default useSWR
