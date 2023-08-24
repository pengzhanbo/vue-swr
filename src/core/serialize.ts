import { toValue } from 'vue'
import type { Arguments, KeyRef } from '../types'
import { stableHash } from '../utils/hash'

export const serialize = (key: KeyRef): [string, Arguments] => {
  key = toValue(key)
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
