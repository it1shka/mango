import { toRef } from 'vue'

// TODO: 

export default {
  template: `

  `,
  props: ['json'],
  setup(props) {
    const json = toRef(props, 'json')

  },
}
