const apiURL = relative => `http://localhost:3131/api/${relative}`
const dispatch = (query, eventName, detail = {}) => {
  const element = document.body.querySelector(query)
  if (!element) {
    console.warn(`Failed to dispatch from element "${query}"`)
    return
  }
  element.dispatchEvent(new CustomEvent(eventName, {
    detail,
    bubbles: true
  }))
}

function main() {
  Alpine.data('connectionString', () => ({
    value: '',

    async connect() {
      try {
        const response = await fetch(apiURL('connect'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conn_str: this.value }),
        })
        const message = await response.text()
        dispatch('.controls', response.ok ? 'success' : 'error', message)
        dispatch('.controls', 'database-update')
      } catch {
        dispatch('.controls', 'error', 'Failed to connect to the MongoDB')
      }
    },
  }))

  Alpine.data('databases', () => ({
    list: [],

    async getList() {
      try {
        const response = await fetch(apiURL('database/list'))
        if (response.ok) {
          this.list = await response.json()
          dispatch('.navigation', 'success', 'Fetched databases')
        } else {
          const message = await response.text()
          dispatch('.navigation', 'error', message)
        }
      } catch {
        dispatch('.navigation', 'error', 'Failed to fetch databases')
      }
    },
  }))

  Alpine.data('database', (name) => ({
    name,
    open: false,
    collections: [],

    async toggle() {
      if (this.open) {
        this.open = false
      } else {
        await this.getCollections()
        this.open = true
      }
    },

    async getCollections() {
      try {
        const query = new URLSearchParams({ database: this.name }).toString()
        const response = await fetch(apiURL(`collection/list?${query}`))
        if (response.ok) {
          this.collections = await response.json()
        } else {
          const message = await response.text()
          dispatch('.navigation', 'error', message)
        }
      } catch {
        dispatch('.navigation', 'error', `Failed to fetch collections for "${this.name}"`)
      }
    },
  }))

  Alpine.data('collection', (name) => ({
    name,
    // TODO: 
  }))
}

window.addEventListener('alpine:init', main)
