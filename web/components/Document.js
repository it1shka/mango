import { ref, toRef, watch, computed, nextTick } from 'vue'
import {apiURL, identifyDocument} from '../lib.js'
import store, { setChosen, addNotification } from '../store.js'

export default {
  template: `
    <div 
      @click="open"
      class="collection-element"
    >
      <img alt="Document" src="/images/document.png" />
      <p>{{ title }}</p>
    </div>
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
          <h1 class="label">Edit document:</h1>
          <textarea ref="editorRef">{{ json }}</textarea>
          <div class="buttons">
            <button type="submit">Edit</button>
            <button @click.prevent="drop">Delete</button>
          </div>
        </form>
      </aside>
    </Teleport>
  `,
  props: ['json'],
  setup(props) {
    const jsonWithId = toRef(props, 'json')
    const json = computed(() => {
      const initial = JSON.parse( JSON.stringify(jsonWithId.value))
      delete initial['_id']
      return initial
    })

    const title = computed(() => {
      return identifyDocument(json.value)
    })

    const isOpen = ref(false)
    const open = () => { isOpen.value = true }
    const close = () => { isOpen.value = false }

    const editorRef = ref(null)
    const editorValue = ref('')
    watch([isOpen, editorRef], () => {
      if (!editorRef.value || !isOpen) return
      editorValue.value = json.value
      const cm = CodeMirror.fromTextArea(editorRef.value, {
        lineNumbers: true,
        mode: 'javascript',
        json: true,
      })
      cm.setSize(450, 450)
      cm.on('change', () => {
        editorValue.value = cm.getValue()
      })
    })

    // again, this is just a hack
    const forceUpdate = () => {
      const current = store.chosen
      setChosen(null)
      nextTick(() => {
        setChosen(current)
      })
    }

    const database = computed(() => store.chosen.database)
    const collection = computed(() => store.chosen.collection)

    const submit = async () => {
      try {
        const id = jsonWithId.value._id.$oid
        const response = await fetch(apiURL('document/edit'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value,
            collection: collection.value,
            id,
            value: editorValue.value
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        forceUpdate()
        close()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to update document',
        })
      }
    }

    const drop = async () => {
      try {
        const id = jsonWithId.value._id.$oid
        const response = await fetch(apiURL('document/delete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            database: database.value,
            collection: collection.value,
            id
          })
        })
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        forceUpdate()
        close()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to delete document'
        })
      }
    }

    return {
      json, 
      title,
      isOpen,
      editorRef,
      open,
      close,
      submit,
      drop,
    }
  },
}
