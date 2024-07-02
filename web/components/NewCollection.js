import { ref, computed } from 'vue'
import store, { addNotification, fetchCollections } from '../store.js'
import { apiURL } from '../lib.js'

export default {
  template: `
    <button @click.stop="open">
      New Collection
    </button>
    <Teleport to="body">
      <aside
        v-if="isOpen"
        @click.stop="close"
        class="fullscreen-panel"
      >
        <form
          @submit.prevent="submit"
          @click.stop
          class="inner-container"
        >
          <h1 class="label">New collection: </h1>
          <input
            required
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
    const database = computed(() => store.chosen.database)

    const isOpen = ref(false)
    const collectionName = ref('')

    const open = () => {
      isOpen.value = true
    }

    const close = () => {
      isOpen.value = false
    }

    const submit = async () => {
      try {
        const response = await fetch(apiURL('collection/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value,
            collection: collectionName.value,
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text()
          })
          return
        }
        collectionName.value = ''
        fetchCollections(database.value)
        close()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to create collection',
        })
      }
    }

    return {
      isOpen,
      collectionName,
      open,
      close,
      submit,
    }
  },
}
