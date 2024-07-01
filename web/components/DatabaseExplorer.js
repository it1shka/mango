import { computed } from 'vue'
import store, { addNotification, refreshDatabases, setChosen } from '../store.js'
import Drop from './Drop.js'
import {apiURL} from '../lib.js'

export default {
  components: { Drop },
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
          <button>New Collection</button>
          <Drop @accepted-drop="drop" />
        </div>
      </div>
    </div>
  `,
  setup() {
    const database = computed(() => store.chosen.database)

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
      drop,
    }
  },
}
