const listItems = require('../../model/listitems')
const phrases = require('./../phrases')
const stringProcessor = require('./../stringprocessor')
const Q = require('q')
const logger = require('winston')

const processResponseTextPromise = (data) => {
  const listItemStrings = stringProcessor.splitByDelimiters(data.supplementaryText)
  logger.log('debug', listItemStrings)
  if (listItemStrings.length === 0) {
    data.responseText = phrases.noListItemToAdd + '\n' + phrases.addListItemExample
    return Q.reject(data)
  }
  const saveNewPromises = listItemStrings.map(listItemString => {
    data.listItemName = listItemString
    return listItems.saveNewPromise(data)
  })
  return Q.all(saveNewPromises).then(result => {
    data.responseText = phrases.success
    return data
  })
}

module.exports = {
  processResponseTextPromise
}
