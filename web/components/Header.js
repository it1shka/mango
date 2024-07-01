import { ref, computed } from 'vue'
import store, { 
  connect,
  refreshDatabases,
} from '../store.js'

export default {
  template: `
    <header id="header">
      <h2>Connect to: </h2>
      <input v-model="connectionString"
        type="text"
        placeholder="Connection string"
      />
      <button @click="connectAndRefresh">Connect</button>
      <button @click="refreshDatabases">Refresh</button>
    </header>
  `,
  setup() {
    const connectionString = ref('localhost')
    const connected = computed(() => store.connected)

    const connectAndRefresh = async () => {
      if (await connect(connectionString.value)) {
        await refreshDatabases()
      }
    }

    return {
      connectionString,
      connected,
      connectAndRefresh,
      refreshDatabases,
    }
  },
}
