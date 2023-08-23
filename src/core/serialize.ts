import { unref } from 'vue'
import type { Arguments, KeyRef } from '../types'
import { stableHash } from '../utils/hash'
import { isFunction } from '../utils/shared'

export const serialize = (key: KeyRef): [string, Arguments] => {
  if (isFunction(key)) {
    try {
      key = key()
    } catch {
      key = ''
    }
  }
  key = unref(key)
  const args = key
  key =
    typeof key === 'string'
      ? key
      : (Array.isArray(key) ? key.length : key)
      ? stableHash(key)
      : ''

  return [key, args]
}

export const unstableSerialize = (key: KeyRef) => serialize(key)[0]
