import { ref, toRef } from 'vue'

// TODO: 

export default {
  template: `
    <div 
      class="collection-element"
    >
      <img alt="Document" src="/images/document.png" />
      <p>Document</p>
    </div>
  `,
  props: ['json'],
  setup(props) {
    const json = toRef(props, 'json')

    const isOpen = ref(false)
    const open = () => { isOpen.value = true }
    const close = () => { isOpen.value = false }

    return {
      isOpen,
      open,
      close,
    }
  },
}
