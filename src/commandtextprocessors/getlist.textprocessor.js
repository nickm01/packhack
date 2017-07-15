const listItems = require('../../model/listitems')
const errors = require('./../errors')
const phrases = require('./../phrases')

const processResponseTextPromise = (data) => {
  return buildListItemsText(data)
    .then(result => {
      result.responseText = result.listItemsText
      return result
    })
}

const buildListItemsText = (data) => {
  return listItems.findPromise(data).then(result => {
    if (result.listItems.length === 0) {
      result.listItemsText = phrases.noItems
    } else {
      const listItemNames = result.listItems.map(item => { return item.listItemName })
      result.listItemsText = '• ' + listItemNames.join('\n• ')
    }
    return result
  })
}

const processError = (data) => {
  if (!data.listExists) {
    // Deal with the 'guess' that they are after a list not typing a command
    // TODO: This actually isn't tested yet NOR has 'get list' without the #
    if (data.errorMessage !== errors.errorTypes.noList &&
      data.words.length === 1 &&
      data.originalText.charAt(0) !== '#') {
      data.command = undefined
      data.list = undefined
      throw data
    }
  }
  return data
}

module.exports = {
  processResponseTextPromise,
  buildListItemsText,
  processError
}
