import { ref, watch, onMounted } from 'vue'
import store, {addNotification} from '../store.js'
import Document from './Document.js'
import {apiURL} from '../lib.js'

export default {
  components: { Document },
  template: `
    <div class="document-viewer">
      <div class="controls">
        <p>Search by </p>
        <textarea ref="searchRef"></textarea>
        <button 
          @click="prevPage" 
          :disabled="page <= 0"
        >Prev</button>
        <h3>Page: {{ page }}</h3>
        <button @click="nextPage">Next</button>
      </div>
      <div class="collections-grid">
        <template v-if="documents?.length > 0">
          <Document 
            v-for="document in documents"
            :key="JSON.stringify(document['_id'])"
            :json="document"
          />
        </template>
        <p v-else>
          No results were found
        </p>
      </div>
    </div>
  `,
  setup() {
    const searchRef = ref(null)
    const search = ref('')
    watch(searchRef, () => {
      if (!searchRef.value) return
      const cm = CodeMirror.fromTextArea(searchRef.value, {
        mode: 'javascript',
        json: true,
        scrollbarStyle: null,
      })
      cm.setSize(400, cm.defaultTextHeight() + 2 * 4)
      cm.on('beforeChange', (_, change) => {
        const newtext = change.text.join('').replace(/\n/g, '')
        change.update(change.from, change.to, [newtext])
        return true
      })
      cm.on('change', () => {
        search.value = cm.getValue()
      })
    })

    const page = ref(0)
    const nextPage = () => { page.value++ }
    const prevPage = () => {
      if (page.value <= 0) return
      page.value--
    }

    const documents = ref([])
    const fetchDocuments = async () => {
      try {
        const { database, collection } = store.chosen
        const params = new URLSearchParams({
          database,
          collection,
          query: search.value,
          page: page.value,
        }).toString()
        const response = await fetch(apiURL(`document/list?${params}`))
        if (!response.ok) {
          addNotification({
            kind: 'error',
            message: await response.text(),
          })
          return
        }
        documents.value = await response.json()
      } catch {
        addNotification({
          kind: 'error',
          message: 'Failed to fetch documents',
        })
      }
    }

    onMounted(fetchDocuments)
    watch([store.chosen, page], fetchDocuments)
    const timer = ref(null)
    watch(search, () => {
      clearTimeout(timer.value)
      timer.value = setTimeout(fetchDocuments, 500)
    })

    return {
      searchRef,
      page,
      documents,
      nextPage,
      prevPage,
    }
  },
}
