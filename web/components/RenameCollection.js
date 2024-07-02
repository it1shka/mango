import { ref, computed } from 'vue'
import store, { addNotification } from '../store.js'

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
