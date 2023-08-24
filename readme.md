# vue-swr

## Usage

还未发布到 npm。

```ts
import useSWR, { useSWRPreload } from 'vue-swr'

useSWRPreload('/api') // 预加载请求

const { isLoading, data, error } = useSWR('/api')
```
