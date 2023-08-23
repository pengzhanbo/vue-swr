import type { Fetcher, FullConfiguration, KeyRef } from '../types'
import { isFunction, mergeObjects } from '../utils/shared'
import { defaultConfig } from './default-config'

export function resolveArgs<
  Data = any,
  Error = any,
  Key extends KeyRef = KeyRef,
>(
  ...args: any[]
): readonly [Key, Fetcher<Data>, FullConfiguration<Data, Error>] {
  const key: Key = args[0]
  let fetcher!: Fetcher<Data>
  let config!: FullConfiguration<Data, Error, Fetcher<Data>>

  if (args.length === 1) {
    config = {} as FullConfiguration<Data, Error>
  } else if (args.length === 2) {
    if (isFunction(args[1])) {
      fetcher = args[1]
      config = {} as FullConfiguration<Data, Error>
    } else {
      config = args[1]
    }
  } else {
    ;[, fetcher, config] = args
  }

  const fullConfig = mergeObjects(
    defaultConfig,
    config || {},
  ) as FullConfiguration<Data, Error, Fetcher<Data>>

  fetcher = fetcher ?? (fullConfig.fetcher as Fetcher<Data>)

  return [key, fetcher, fullConfig]
}
