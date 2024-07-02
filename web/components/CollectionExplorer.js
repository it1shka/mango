import { computed } from 'vue'
import store, { setChosen, addNotification, fetchCollections, refreshDatabases } from '../store.js'
import Drop from './Drop.js'
import {apiURL} from '../lib.js'

export default {
  components: { Drop },
  template: `
    <div id="explorer">
      <div class="general-info">
        <img 
          alt="Collection"
          src="/images/collection.png"
        />
        <div>
          <h1>{{ collection }}</h1>
          <p>
            Collection from 
            <a @click.prevent="setChosen({ database, collection: null })">
              {{ database }}
            </a>
          </p>
        </div>
        <div class="actions">
          <Drop @accepted-drop="drop" />
        </div>
      </div> 
    </div>
  `,
  setup() {
    const database = computed(() => store.chosen.database)
    const collection = computed(() => store.chosen.collection)

    const drop = async () => {
      try {
        const response = await fetch(apiURL('collection/delete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value,
            collection: collection.value,
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        refreshDatabases()
        fetchCollections(database.value)
        setChosen(null)
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to drop collection',
        })
      }
    }

    return {
      database,
      collection,
      drop,
      setChosen,
    }
  },
}
