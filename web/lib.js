export const apiURL = relative => {
  return `http://localhost:3131/api/${relative}`
}

const nestedEntries = obj => {
  if (typeof obj !== 'object') return []
  const entries = Object.entries(obj)
  const output = []
  for (const [key, value] of entries) {
    if (typeof value !== 'object') {
      output.push([key, value])
    } else {
      output.push(...nestedEntries(value))
    }
  }
  return output
}


export const identifyDocument = doc => {
  const targets = ['name', 'tag', 'label', 'title', 'id']
  const entries = nestedEntries(doc)
  for (const target of targets) {
    for (const [key, value] of entries) {
      if (key.includes(target)) {
        return value
      }
    }
  }
  return 'Document'
}

export const sleep = time => {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}
