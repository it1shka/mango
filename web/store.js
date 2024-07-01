import { reactive } from 'vue'

const store = reactive({
  chosen: null,
  notifications: [],
  connected: false,
  databases: [],
})

export const setChosen = (value) => {
  store.chosen = value
}

export const addNotification = (notification) => {
  store.notifications.push(notification)
}

export const getNotification = () => {
  return store.notification.shift()
}

export const setConnected = (flag) => {
  store.connected = flag
}

export const setDatabases = (value) => {
  store.databases = value
}

export const addDatabase = (value) => {
  store.databases.push(value)
}

export default store
