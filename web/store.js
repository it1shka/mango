import { reactive } from 'vue'
import { apiURL } from './lib.js'

const store = reactive({
  connected: false,
  chosen: null,
  notifications: [],
  databases: [],
  collections: {},
})

export default store

export const setChosen = (value) => {
  store.chosen = value
}

export const addNotification = (notification) => {
  if (notification.kind === 'error') {
    console.error(notification.message)
  }
  store.notifications.push(notification)
}

export const popNotification = () => {
  return store.notification.shift()
}

export const fetchCollections = async (database) => {
  try {
    const params = new URLSearchParams({ database })
    const url = apiURL(`collection/list?${params.toString()}`)
    const response = await fetch(url)
    if (!response.ok) {
      delete store.collections[database]
      addNotification({
        kind: 'error',
        message: await response.text(),
      })
      return
    }
    store.collections[database] = await response.json()
  } catch {
    collections.value = []
    addNotification({
      kind: 'error',
      message: `Failed to fetch collections for "${name}"`
    })
  }
}

export const refreshDatabases = async () => {
  if (!store.connected) {
    addNotification({
      kind: 'error',
      message: 'Not connected',
    })
    return
  }
  try {
    const response = await fetch(apiURL('database/list'))
    if (!response.ok) {
      store.databases = []
      addNotification({
        kind: 'error',
        message: await response.text(),
      })
      return
    }
    store.databases = await response.json()
  } catch {
    addNotification({
      kind: 'error',
      message: 'Failed to fetch databases',
    })
  }
}

export const connect = async (conn_str) => {
  try {
    const response = await fetch(apiURL('connect'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conn_str })
    })
    addNotification({ 
      kind: response.ok ? 'success' : 'error', 
      message: await response.text(),
    })
    store.connected = response.ok
    return response.ok
  } catch {
    addNotification({
      kind: 'error',
      message: `Failed to connect to ${connectionString.value}`,
    })
    store.connected = false
    return false
  }
}
