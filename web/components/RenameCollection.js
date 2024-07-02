import { ref, computed } from 'vue'
import store, { addNotification, fetchCollections, setChosen } from '../store.js'
import {apiURL} from '../lib.js'

export default {
  template: `
    <button @click.stop="open">
      Rename
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
          <h1 class="label">Rename collection: </h1>
          <input
            required
            v-model="newName"
            type="text"
            placeholder="New name: "
          />
          <button type="submit">Rename</button>
        </form>
      </aside>
    </Teleport>
  `,
  setup() {
    const database = computed(() => store.chosen.database)
    const collection = computed(() => store.chosen.collection)
    const newName = ref('')

    const isOpen = ref(false)
    const open = () => { isOpen.value = true }
    const close = () => { isOpen.value = false }

    const submit = async () => {
      try {
        const response = await fetch(apiURL('collection/rename'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value,
            collection: collection.value,
            name: newName.value,
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        fetchCollections(database.value)
        setChosen({
          database: database.value,
          collection: newName.value
        })
        close()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to rename collection',
        })
      }
    }

    return {
      database,
      collection,
      newName,
      isOpen,
      open,
      close,
      submit,
    }
  },
}
