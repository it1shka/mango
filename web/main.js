import { createApp } from 'vue'
import Header from './components/Header.js'
import Navigation from './components/Navigation.js'
import Explorer from './components/Explorer.js'
import Notifications from './components/Notifications.js'

const app = createApp({
  components: {
    Header,
    Navigation,
    Explorer,
    Notifications,
  },
  template: `
    <Header />
    <Navigation />
    <Explorer />
    <Notifications />
  `,
})

app.mount('#app')
