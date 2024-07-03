import { ref, toRef, watch, computed } from 'vue'
import {identifyDocument} from '../lib.js'

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
          <!-- TODO: add delete button -->
          <button type="submit">Edit</button>
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

    // TODO: 
    const submit = () => {
      try {

      } catch {

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
    }
  },
}
