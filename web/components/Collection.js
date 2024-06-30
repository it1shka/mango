import { computed } from 'vue'
import store, { setChosen } from '../store.js'

export default {
  template: `
    <div 
      @click="choose"
      :class="{ chosen: isChosen, collection: true }"
    >
      <p>{{ name }}</p>
    </div>
  `,
  props: ['database', 'name'],
  setup({ database, name }) {
    const choose = () => {
      setChosen({
        database,
        collection: name,
      })
    }

    const isChosen = computed(() => {
      if (!store.chosen) return false
      return store.chosen.database === database &&
        store.chosen.collection === name
    })

    return {
      name,
      isChosen,
      choose,
    }
  },
}
