import { isUndefined } from './shared'

const table = new WeakMap<object, string | number>()

let counter = 0

export const stableHash = (arg: any): string => {
  const type = typeof arg
  const constructor = arg && arg.constructor
  const isDate = constructor === Date

  let result: any
  let index: any

  if (Object(arg) === arg && !isDate && constructor !== RegExp) {
    result = table.get(arg)
    if (result) return result

    result = `${++counter}~`
    table.set(arg, result)
    // eslint-disable-next-line eqeqeq
    if (constructor == Array) {
      result = '@'
      for (index = 0; index < arg.length; index++) {
        result += `${stableHash(arg[index])},`
      }
      table.set(arg, result)
    }
    // eslint-disable-next-line eqeqeq
    if (constructor == Object) {
      result = '#'
      const keys = Object.keys(arg).sort()
      // eslint-disable-next-line no-cond-assign
      while (!isUndefined((index = keys.pop() as string))) {
        if (!isUndefined(arg[index])) {
          result += `${index}:${stableHash(arg[index])},`
        }
      }
      table.set(arg, result)
    }
  } else {
    result = isDate
      ? arg.toJson()
      : type === 'symbol'
      ? arg.toString()
      : type === 'string'
      ? JSON.stringify(arg)
      : // eslint-disable-next-line prefer-template
        '' + arg
  }
  return result
}
