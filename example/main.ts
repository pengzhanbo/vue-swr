import { createApp, ref, watch } from 'vue'
import useSWR from 'vue-swr'
import App from './App.vue'

createApp(App).mount('#app')

// useSWRPreload('/api')

const { isLoading, data, error, trigger } = useSWR(ref('/api'), {
  immediate: false,
})
// setTimeout(() => useSWR('/api'), 2100)
trigger()
trigger()
trigger()
watch(
  () => data.value,
  (data) => {
    // eslint-disable-next-line no-console
    console.log(data)
  },
)
