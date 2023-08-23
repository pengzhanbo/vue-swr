import { createApp, ref, watch } from 'vue'
import useSWR, { useSWRPreload } from 'vue-swr'
import App from './App.vue'

createApp(App).mount('#app')

useSWRPreload('/api')

const { isLoading, data, error } = useSWR(ref('/api'))
setTimeout(() => useSWR('/api'), 2100)

watch(
  () => data.value,
  (error) => {
    // eslint-disable-next-line no-console
    console.log(error)
  },
)
