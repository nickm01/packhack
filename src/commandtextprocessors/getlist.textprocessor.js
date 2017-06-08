const listItems = require('../../model/listItems')
const Q = require('q')

const processResponseTextPromise = (data) => {
  return listItems.findPromise(data).then(result => {
    if (result.listItems.length === 0) {
      result.responseText = 'Currently no items in #' + result.list + '.'
    } else {
      result.responseText = '• ' + result.listItems.join('\n• ')
    }
    return result
  })
}

const processErrorPromise = (data) => {
  if (data.listExists === false) {
    data.responseText = 'Sorry, couldn\'t find #' + data.list + '\nType "get lists" to see whats avauilable.'
  }
  return Q.resolve(data)
}

module.exports = {
  processResponseTextPromise,
  processErrorPromise
}
