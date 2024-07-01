import { ref } from 'vue'
import { addNotification, refreshDatabases } from '../store.js'
import { apiURL } from '../lib.js'

export default {
  template: `
    <button 
      @click.stop="openPanel" 
      id="new-database"
    >New</button>
    <Teleport to="body">
      <aside 
        v-if="open" 
        @click.stop="closePanel"
        class="fullscreen-panel"
      >
        <form 
          @submit.prevent="submit"
          @click.stop
          class="inner-container"
        >
          <h1 class="label">New database:</h1>
          <input 
            v-model="databaseName"
            type="text"
            placeholder="Database name: "
          />
          <input 
            v-model="collectionName"
            type="text"
            placeholder="Collection name: "
          />
          <button type="submit">Create</button>
        </form>
      </aside>
    </Teleport>
  `,
  setup() {
    const open = ref(false)

    const openPanel = () => {
      open.value = true
    }

    const closePanel = () => {
      open.value = false
    }

    const databaseName = ref('')
    const collectionName = ref('')

    const submit = async () => {
      try {
        const response = await fetch(apiURL('database/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: databaseName.value,
            collection: collectionName.value,
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        databaseName.value = ''
        collectionName.value = ''
        refreshDatabases()
        closePanel()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to create database',
        })
      }
    }

    return {
      open,
      databaseName,
      collectionName,
      openPanel,
      closePanel,
      submit,
    }
  },
}
