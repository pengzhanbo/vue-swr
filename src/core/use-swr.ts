import type { Fetcher, KeyRef, SWRConfiguration, SWRResponse } from '../types'
import { initCache } from './cache'
import { resolveArgs } from './resolve-arg'
import useSWRHandler from './swr-handler'

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
