const listItems = require('../../model/listitems')
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
      let count = 0
      result.listItemsText = listItemNames
        .map(itemName => {
          return '' + ++count + '. ' + itemName
        })
        .join('\n') +
        '\n' + phrases.editListRemoveSuggestion
    }
    return result
  })
}

module.exports = {
  processResponseTextPromise,
  buildListItemsText
}
