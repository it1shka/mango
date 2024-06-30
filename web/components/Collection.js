export default {
  template: `
    <div :class="{ chosen: isChosen, collection: true }">
      <p>{{ name }}</p>
    </div>
  `,
  props: ['database', 'name'],
  setup({ database, name }) {
    
    return {
      name,
      isChosen: false
    }
  },
}
