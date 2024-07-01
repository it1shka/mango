import { computed, ref } from 'vue'
import Collection from './Collection.js'
import store, { setChosen, fetchCollections } from '../store.js'

export default {
  components: { Collection },
  template: `
    <div 
      :class="{ chosen: isChosen, database: true }" 
      @click.stop="choose"
    >
      <button 
        v-text="open ? '-' : '+'"
        @click.stop="toggleOpen"
      ></button>
      <p>{{ name }}</p>
    </div>
    <template v-if="open">
      <Collection 
        v-for="collection in collections"
        :key="collection"
        :name="collection"
        :database="name"
      />
    </template>
  `,
  props: ['name'],
  setup({ name }) {
    const open = ref(false)
    const collections = computed(() => store.collections[name] ?? [])

    const toggleOpen = () => {
      open.value = !open.value
      if (!open.value) return
      fetchCollections(name)
    }

    const isChosen = computed(() => {
      if (!store.chosen) return
      return name === store.chosen.database &&
        !store.chosen.collection
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
