import { ref, computed, watch } from 'vue'
import store, { addNotification } from '../store.js'
import {apiURL} from '../lib.js'

export default {
  template: `
    <button @click.stop="open">
      New Document
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
          <h1 class="label">New document:</h1>
          <textarea ref="codemirror"></textarea>
          <button type="submit">Create</button>
        </form>
      </aside>
    </Teleport>
  `,
  setup() {
    const codemirror = ref(null)
    const editor = ref(null)
    watch(codemirror, () => {
      if (!codemirror.value) return
      editor.value = CodeMirror.fromTextArea(codemirror.value, {
        lineNumbers: true,
        mode: 'javascript',
        json: true,
      })
      editor.value.setSize(450, 450)
    })

    const isOpen = ref(false)
    const open = () => { isOpen.value = true }
    const close = () => { isOpen.value = false }

    const database = computed(() => store.chosen.database)
    const collection = computed(() => store.chosen.collection)

    const submit = async () => {
      try {
        const response = await fetch(apiURL('document/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value,
            collection: collection.value,
            document: editor.value.getValue(),
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        // TODO:
        // TODO:
        addNotification({
          kind: 'success',
          message: 'Document was successfully created',
        })
        close()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to create document',
        })
      }
    }

    return {
      isOpen,
      codemirror,
      open,
      close,
      submit,
    }
  },
}
