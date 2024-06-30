import { ref } from 'vue'

// TODO: finish

export default {
  template: `
    <button 
      @click="openPanel" 
      id="new-database"
    >New</button>
    <aside 
      v-if="open" 
      @click="closePanel"
      class="fullscreen-panel"
    >
      <form 
        @submit.prevent="submit"
        @click.stop
        class="creation-form"
      >

      </form>
    </aside>
  `,
  setup() {
    const open = ref(false)

    const openPanel = () => {
      open.value = true
    }

    const closePanel = () => {
      open.value = false
    }

    const submit = () => {

    }

    return {
      open,
      openPanel,
      closePanel,
      submit,
    }
  },
}
