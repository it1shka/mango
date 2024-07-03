import { toRef } from 'vue'

// TODO: 

export default {
  template: `
    <div class="collection-element">
      <img alt="Document" src="/images/document.png" />
      <p>Document</p>
    </div>
  `,
  props: ['json'],
  setup(props) {
    const json = toRef(props, 'json')
    
  },
}
