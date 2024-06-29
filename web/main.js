import { createApp } from 'vue'
import Header from './components/Header.js'
import Navigation from './components/Navigation.js'
import Explorer from './components/Explorer.js'

const app = createApp({
  components: {
    Header,
    Navigation,
    Explorer,
  },
  template: `
    <Header />
    <Navigation />
    <Explorer />
  `,
})

app.mount('#app')
