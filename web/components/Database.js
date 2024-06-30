import { computed, ref } from 'vue'
import Collection from './Collection.js'
import store, { setChosen, addNotification } from '../store.js'
import {apiURL} from '../lib.js'

export default {
  components: { Collection },
  template: `
    <div 
      :class="{ chosen: isChosen, database: true }" 
      @click="choose"
    >
      <button 
        v-text="open ? '-' : '+'"
        @click.stop="toggleOpen"
      ></button>
      <p>{{ name }}</p>
    </div>
    <template v-if="open">
      <Collection v-for="collection in collections"
        :name="collection"
        :database="name"
      />
    </template>
  `,
  props: ['name'],
  setup({ name }) {
    const open = ref(false)
    const collections = ref([])

    const fetchCollections = async () => {
      try {
        const params = new URLSearchParams({ database: name })
        const url = apiURL(`collection/list?${params.toString()}`)
        const response = await fetch(url)
        if (response.ok) {
          collections.value = await response.json()
        } else {
          collections.value = []
          const message = await response.text()
          addNotification({
            kind: 'error',
            message
          })
        }
      } catch {
        collections.value = []
        addNotification({
          kind: 'error',
          message: `Failed to fetch collections for "${name}"`
        })
      }
    }

    const toggleOpen = () => {
      open.value = !open.value
      if (open.value) {
        fetchCollections()
      }
    }

    const isChosen = computed(() => {
      return name === store.chosen?.database
    })

    const choose = () => {
      setChosen({
        database: name,
        collection: null,
      })
    }

    return { 
      name,
      open,
      toggleOpen,
      isChosen,
      choose,
      collections,
    }
  },
}
