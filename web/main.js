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

const getUserConfirmation = () => {
  const widget = document.createElement('div')
  widget.classList.add('user-confirmation')
  const label = document.createElement('h1')
  label.textContent = 'Are you sure?'
  widget.appendChild(label)
  const buttons = document.createElement('div')
  buttons.classList.add('buttons')
  const yes = document.createElement('button')
  yes.textContent = 'yes'
  yes.classList.add('yes')
  buttons.appendChild(yes)
  const no = document.createElement('button')
  no.textContent = 'no'
  no.classList.add('no')
  buttons.appendChild(no)
  widget.appendChild(buttons)
  document.body.appendChild(widget)
  return new Promise(resolve => {
    yes.onclick = () => {
      document.body.removeChild(widget)
      resolve(true)
    }
    no.onclick = () => {
      document.body.removeChild(widget)
      resolve(false)
    }
  })
}

function main() {
  Alpine.store('chosen', {
    database: null,
    collection: null,

    set(database, collection) {
      this.database = database
      this.collection = collection
    }
  })

  Alpine.data('connectionString', () => ({
    value: 'localhost',

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

    async drop() {
      const confirmation = await getUserConfirmation()
      if (!confirmation) return
      try {
        const response = await fetch(apiURL('database/delete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ database: this.name }),
        })
        if (response.ok) {
          dispatch('.navigation', 'database-update')
        } else {
          const message = await response.text()
          dispatch('.navigation', 'error', message)
        }
      } catch {
        dispatch('.navigation', 'error', 'Failed to drop database')
      }
    }
  }))

  Alpine.data('collection', (database, name) => ({
    database,
    name,
    active: false,
    renaming: false,
    newName: name,

    async rename() {
      if (!this.renaming) return
      if (this.newName === name) {
        this.renaming = false
        return
      }
      try {
        const body = JSON.stringify({ 
          database: this.database,
          collection: this.name,
          name: this.newName,
        })
        const response = await fetch(apiURL('collection/rename'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body,
        })
        if (response.ok) {
          this.name = this.newName
          this.renaming = false
        } else {
          const message = await response.text()
          dispatch('.navigation', 'error', message)
        }
      } catch {
        dispatch('.navigation', 'error', 'Failed to rename collection')
      }
    },

    cancelRename() {
      this.newName = this.name
      this.renaming = false
    }
  }))
}

window.addEventListener('alpine:init', main)
