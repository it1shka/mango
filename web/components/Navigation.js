import { computed } from 'vue'
import Database from './Database.js'
import store  from '../store.js'

export default {
  components: { Database },
  template: `
    <aside id="navigation">
      <template v-if="connected">
        <Database 
          v-for="database in databases" 
          :name="database" 
        />
      </template>
      <p v-else class="empty">Not connected</p>
    </aside>
  `,
  setup() {
    const connected = computed(() => store.connected)
    const databases = computed(() => store.databases)
    return { connected, databases }
  },
}
