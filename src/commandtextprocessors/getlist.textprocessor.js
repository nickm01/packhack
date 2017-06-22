const listItems = require('../../model/listitems')
const errors = require('./../errors')
const Q = require('q')
const phrases = require('./../phrases')

const processResponseTextPromise = (data) => {
  return listItems.findPromise(data).then(result => {
    if (result.listItems.length === 0) {
      result.responseText = phrases.noItems + result.list + '.'
    } else {
      const listItemNames = result.listItems.map(item => { return item.listItemName })
      result.responseText = '• ' + listItemNames.join('\n• ')
    }
    return result
  })
}

const processErrorPromise = (data) => {
  if (!data.listExist) {
    // Deal with the 'guess' that they are after a list not typing a command
    if (data.errorMessage === errors.errorTypes.noList) {
      data.responseText = phrases.getListNoList
    } else if (data.words.length === 1 && data.originalText.charAt(0) !== '#') {
      data.command = undefined
      data.list = undefined
      throw data
    } else {
      data.responseText = phrases.listNotFound + data.list + '\n' + phrases.suggestGetLists
    }
  }
  return Q.resolve(data)
}

module.exports = {
  processResponseTextPromise,
  processErrorPromise
}
