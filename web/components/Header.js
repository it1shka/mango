import { ref, computed } from 'vue'
import { apiURL } from '../lib.js'
import store, { 
  addNotification, 
  setConnected,
  setDatabases,
} from '../store.js'

export default {
  template: `
    <header id="header">
      <h2>Connect to: </h2>
      <input v-model="connectionString"
        type="text"
        placeholder="Connection string"
      />
      <button @click="connect">Connect</button>
      <button @click="refresh">Refresh</button>
    </header>
  `,
  setup() {
    const connectionString = ref('localhost')
    const connected = computed(() => store.connected)

    const refresh = async () => {
      if (!connected) {
        addNotification({
          kind: 'error',
          message: 'Not connected',
        })
        return
      }
      try {
        const response = await fetch(apiURL('database/list'))
        if (response.ok) {
          const databases = await response.json()
          setDatabases(databases)
        } else {
          const message = await response.text()
          addNotification({
            kind: 'error',
            message,
          })
        }
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to fetch databases',
        })
      }
    }

    const connect = async () => {
      try {
        const response = await fetch(apiURL('connect'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conn_str: connectionString.value,
          })
        })
        const kind = response.ok ? 'success' : 'error'
        const message = await response.text()
        addNotification({ kind, message })
        if (response.ok) {
          setConnected(true)
          await refresh()
        } else {
          setConnected(false)
        }
      } catch {
        addNotification({
          kind: 'error',
          message: `Failed to connect to ${connectionString.value}`,
        })
        setConnected(false)
      }
    }

    return {
      connectionString,
      connected,
      connect,
      refresh,
    }
  },
}
