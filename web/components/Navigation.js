import { computed } from 'vue'
import Database from './Database.js'
import NewDatabase from './NewDatabase.js'
import store, { setChosen } from '../store.js'

export default {
  components: { Database, NewDatabase },
  template: `
    <aside @click="cancelChoice" id="navigation">
      <template v-if="connected">
        <Database 
          v-for="database in databases" 
          :key="database"
          :name="database" 
        />
        <NewDatabase />
      </template>
      <p v-else class="empty">Not connected</p>
    </aside>
  `,
  setup() {
    const connected = computed(() => store.connected)
    const databases = computed(() => store.databases)
    const cancelChoice = () => {
      setChosen(null)
    }
    return { 
      connected, 
      databases,
      cancelChoice,
    }
  },
}
