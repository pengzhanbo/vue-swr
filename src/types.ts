import type { MaybeRefOrGetter, Ref, ShallowRef, UnwrapRef } from 'vue'

export interface GlobalState<Data = unknown> {
  FETCH: Record<string, [FetcherResponse<Data>, number]>
  PRELOAD: Record<string, FetcherResponse<Data>> // 预加载
  DEDUPE: Record<string, [NodeJS.Timeout, number, number]> // 数据保鲜时间，过期删除
}

type ArgumentsTuple = [any, ...unknown[]] | readonly [any, ...unknown[]]
export type Arguments =
  | string
  | ArgumentsTuple
  | Record<any, any>
  | null
  | undefined
  | false

export type KeyRef = MaybeRefOrGetter<Arguments>

export type FetcherResponse<Data = unknown> = Data | Promise<Data>

export type BareFetcher<Data = unknown> = (
  ...args: any[]
) => FetcherResponse<Data>
export type Fetcher<
  Data = unknown,
  SWRKey extends KeyRef = KeyRef,
> = UnMaybeRefOrGetter<SWRKey> extends () =>
  | infer Arg
  | null
  | undefined
  | false
  ? (arg: Arg) => FetcherResponse<Data>
  : UnMaybeRefOrGetter<SWRKey> extends null | undefined | false
  ? never
  : UnMaybeRefOrGetter<SWRKey> extends infer Arg
  ? (arg: Arg) => FetcherResponse<Data>
  : never

export type UnMaybeRefOrGetter<T> = T extends () => infer R ? R : UnwrapRef<T>

export interface InternalConfiguration<Data> {
  cache: Cache<[Data, number]>
}

export interface PublicConfiguration<
  Data = unknown,
  Error = unknown,
  Fn extends Fetcher<Data> = BareFetcher<Data>,
> {
  /**
   * 是否立即执行请求
   */
  immediate: boolean

  /**
   * 加载超时时间，单位：ms
   */
  loadingTimeout: number
  /**
   * 数据缓存时间，单位：ms
   */
  dedupingInterval: number

  /**
   * 自动重新请求时间间隔，单位：ms
   * @default 0
   */
  refreshInterval: number
  /**
   * 是否在重新获取焦点时重新请求
   */
  revalidateOnFocus: boolean
  /**
   * 是否在回复连接时重新请求
   */
  revalidateOnReconnect: boolean
  /**
   * 是否在组件挂载时启用自动重新请求
   */
  revalidateOnMount: boolean
  /**
   * 在一段时间内只重新验证一次，单位：ms
   */
  focusThrottleInterval: number

  /**
   * 回退数据
   */
  fallbackData?: Data
  /**
   * 请求函数
   */
  fetcher: Fn

  onSuccess?: (
    data: Data,
    key: string,
    config: Readonly<PublicConfiguration<Data, Error, Fn>>,
  ) => void

  onError?: (
    error: Error,
    key: string,
    config: Readonly<PublicConfiguration<Data, Error, Fn>>,
  ) => void

  onLoadSlow?: (
    key: string,
    config: Readonly<PublicConfiguration<Data, Error, Fn>>,
  ) => void

  /**
   * 是否在请求失败时重试
   */
  shouldRetryOnError: boolean
  /**
   * 重试间隔
   */
  errorRetryInterval: number
  /**
   * 最大重试次数
   */
  errorRetryCount: number

  onErrorRetry?: (
    error: Error,
    key: string,
    config: Readonly<PublicConfiguration<Data, Error, Fn>>,
    retryCount: number,
  ) => void
}

export interface FullConfiguration<
  Data = unknown,
  Error = unknown,
  Fn extends Fetcher<Data> = BareFetcher<Data>,
> extends PublicConfiguration<Data, Error, Fn>,
    InternalConfiguration<Data> {}

export type SWRConfiguration<
  Data = unknown,
  Error = unknown,
  Fn extends Fetcher<Data> = BareFetcher<Data>,
> = Partial<PublicConfiguration<Data, Error, Fn>>

export interface Cache<Data = unknown> {
  keys: () => IterableIterator<string>
  get: (key: string) => Data | undefined
  set: (key: string, value: Data) => void
  delete: (key: string) => void
}

export interface SWRResponse<Data = unknown, Error = unknown> {
  data: ShallowRef<Data | null>
  error: ShallowRef<Error | null>
  isLoading: Ref<boolean>
  trigger: () => Promise<Omit<SWRResponse<Data, Error>, 'trigger'>>
}
