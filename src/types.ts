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
  loadingTimeout: number
  dedupingInterval: number

  immediate: boolean

  fallbackData?: Data

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

  shouldRetryOnError: boolean
  errorRetryInterval: number
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
