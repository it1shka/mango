import { computed, onMounted, watch } from 'vue'
import store, { addNotification, fetchCollections, refreshDatabases, setChosen } from '../store.js'
import Drop from './Drop.js'
import NewCollection from './NewCollection.js'
import {apiURL} from '../lib.js'

export default {
  components: { Drop, NewCollection },
  template: `
    <div id="explorer">
      <div class="general-info">
        <img 
          alt="Database"
          src="/images/database.png"
        />
        <div>
          <h1>{{ database }}</h1>
          <p>Database</p>
        </div>
        <div class="actions">
          <NewCollection />
          <Drop @accepted-drop="drop" />
        </div>
      </div>
      <div class="collections-grid">
        <div 
          v-for="collection in collections"
          :key="collection"
          @click="setChosen({ database, collection })"
          class="collection-element"
        >
          <img alt="collection" src="/images/collection.png" />
          <p>{{ collection }}</p>
        </div>
      </div>
    </div>
  `,
  setup() {
    const database = computed(() => store.chosen.database)
    const collections = computed(() => store.collections[store.chosen.database])

    const updateCollections = () => { fetchCollections(store.chosen.database) }
    onMounted(updateCollections)
    watch(database, updateCollections)

    const drop = async () => {
      try {
        const response = await fetch(apiURL('database/delete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        setChosen(null)
        refreshDatabases()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to drop database',
        })
      }
    }

    return {
      database,
      collections,
      drop,
      setChosen,
    }
  },
}
