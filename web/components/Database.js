// TODO: complete this component

export default {
  template: `
    <p>{{ name }}</p>
  `,
  props: ['name'],
  setup({ name }) {
    return { name }
  },
}
