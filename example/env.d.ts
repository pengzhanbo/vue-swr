/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const com: DefineComponent<{}, {}, any>
  export default com
}
