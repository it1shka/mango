import { computed } from 'vue'
import DatabaseExplorer from './DatabaseExplorer.js'
import CollectionExplorer from './CollectionExplorer.js'
import store from '../store.js'

export default {
  components: {
    DatabaseExplorer,
    CollectionExplorer,
  },
  template: `
    <div id="explorer">
      <DatabaseExplorer 
        v-if="flag === 'database'" 
      />
      <CollectionExplorer 
        v-else-if="flag === 'collection'" 
      />
      <div 
        v-else
        class="empty"
      >
        <h2>No objects selected</h2>
      </div>
    </div>
  `,
  setup() {
    const flag = computed(() => {
      if (!store.chosen) return 'empty'
      const { database, collection } = store.chosen
      if (!database && !collection) return 'empty'
      if (!collection) return 'database'
      return 'collection'
    })

    return { flag }
  },
}
