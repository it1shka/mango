import { ref } from 'vue'

export default {
  template: `
    <button @click="open">Drop</button>
    <Teleport to="body">
      <aside
        v-if="isOpen"
        @click.stop="close"
        class="fullscreen-panel"
      >
        <div @click.stop class="inner-container">
          <h1 class="label">
            Are you sure?
          </h1>
          <div class="buttons">
            <button @click="applyAction">Yes</button>
            <button @click="close">No</button>
          </div>
        </div>
      </aside>
    </Teleport>
  `,
  props: ['action'],
  emits: ['accepted-drop'],
  setup(_, { emit }) {
    const isOpen = ref(false)

    const open = () => {
      isOpen.value = true
    }

    const close = () => {
      isOpen.value = false
    }

    const applyAction = () => {
      close()
      emit('accepted-drop')
    }

    return {
      isOpen,
      open,
      close,
      applyAction,
    }
  },
}
