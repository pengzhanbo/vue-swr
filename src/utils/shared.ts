export const noop = () => {}

export const isFunction = <
  T extends (...args: any[]) => any = (...args: any[]) => any,
>(
  val: unknown,
): val is T => typeof val === 'function'

export const mergeObjects = (a: any, b: any) => ({ ...a, ...b })

export const isPromise = (val: unknown): val is PromiseLike<unknown> =>
  isFunction((val as any).then)

export const isUndefined = (val: unknown): val is undefined =>
  typeof val === 'undefined'

export const timestamp = () => Date.now()

export const isWindowDefined = typeof window !== 'undefined'
export const isDocumentDefined = typeof document !== 'undefined'
