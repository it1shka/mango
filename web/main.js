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

const promptUser = (label, fieldNames) => {
  const widget = document.createElement('div')
  widget.classList.add('prompt')
  const form = document.createElement('form')
  const title = document.createElement('h1')
  title.classList.add('title')
  title.textContent = label
  form.appendChild(title)
  const fields = {}
  for (const fieldName of fieldNames) {
    const input = document.createElement('input')
    input.classList.add('field')
    input.required = true
    input.placeholder = fieldName.replace(/^./, e => e.toUpperCase())
    form.appendChild(input)
    fields[fieldName] = input
  }
  const button = document.createElement('button')
  button.type = 'submit'
  button.classList.add('submit')
  button.textContent = 'Ok'
  form.appendChild(button)
  widget.appendChild(form)
  document.body.appendChild(widget)
  return new Promise((resolve, reject) => {
    const close = () => document.body.removeChild(widget)
    widget.onclick = () => {
      close()
      reject('closed')
    }
    form.onclick = event => event.stopPropagation()
    form.onsubmit = event => {
      event.preventDefault()
      const fieldValues = {}
      for (const [fieldName, fieldElem] of Object.entries(fields)) {
        fieldValues[fieldName] = fieldElem.value
      }
      close()
      resolve(fieldValues)
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
    },

    setNull() {
      this.database = null
      this.collection = null
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

    async createDatabase() {
      try {
        const data = await promptUser('New database', ['database', 'collection'])
        const response = await fetch(apiURL('database/create'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        if (response.ok) {
          dispatch('.controls', 'database-update')
        } else {
          dispatch('.controls', 'error', 'Failed to create database')
        }
      } catch (error) {
        if (error === 'closed') return
        dispatch('.constrols', 'error', 'Failed to create database')
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

    async drop(chosenDatabase) {
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
          if (this.name === chosenDatabase) {
            dispatch('.navigation', 'clear-chosen')
          }
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

  Alpine.data('explorer', () => ({
    async dropCollection(database, collection) {
      const confirmed = await getUserConfirmation()
      if (!confirmed) return
      try {
        const response = await fetch(apiURL('collection/delete'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ database, collection }),
        })
        if (response.ok) {
          dispatch('.explorer', 'clear-chosen')
          dispatch('.explorer', 'database-update')
        } else {
          const message = await response.text()
          dispatch('.explorer', 'error', message)
        }
      } catch {
        dispatch('.explorer', 'error', 'Failed to drop collection')
      }
    },

    async insertDocument(database, collection) {

    }
  }))
}

window.addEventListener('alpine:init', main)
