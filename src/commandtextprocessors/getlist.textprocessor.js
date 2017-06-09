const listItems = require('../../model/listItems')
const errors = require('./../errors')
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
  if (!data.listExist) {
    // Deal with the 'guess' that they are after a list not typing a command
    if (data.errorMessage === errors.errorTypes.noList) {
      data.responseText = 'Sorry please specify a list\ne.g. "get shopping"'
    } else if (data.words.length === 1 && data.originalText.charAt(0) !== '#') {
      data.command = undefined
      data.list = undefined
      throw data
    } else {
      data.responseText = 'Sorry, couldn\'t find #' + data.list + '\nType "get lists" to see what\'s available.'
    }
  }
  return Q.resolve(data)
}

module.exports = {
  processResponseTextPromise,
  processErrorPromise
}
