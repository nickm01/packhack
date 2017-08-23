const listItems = require('../../model/listitems')
const phrases = require('./../phrases')
const stringProcessor = require('./../stringprocessor')
const Q = require('q')
const errors = require('./../errors')
const logger = require('winston')

const processResponseTextPromise = data => {
  data.listItemStrings = stringProcessor.splitByDelimiters(data.supplementaryText)
  logger.log('debug', data.listItemStrings)
  if (data.listItemStrings.length === 0) {
    data.responseText = phrases.noListItemToRemove + '\n' + phrases.removeListItemExample
    return Q.reject(data)
  }
  return replaceIndexWithItemNameIfAllNumeric(data)
    .then(processAllDeletesPromise)
    .then(result => {
      data.responseText = phrases.success
      return data
    })
}

const replaceIndexWithItemNameIfAllNumeric = (data) => {
  if (stringProcessor.allNumeric(data.listItemStrings)) {
    logger.log('debug', 'allNumeric')
    data.allNumeric = true
    return listItems.findPromise(data)
      .then(data => {
        data.listItemStrings = data.listItemStrings.map(listItemUserIndex => {
          const index = Number(listItemUserIndex) - 1 // javascript indexes start at 0
          if (data.listItems[index] &&
            data.listItems[index].listItemName) {
            return data.listItems[index].listItemName
          }
          // if not found, will return the original 1-starting index
          return listItemUserIndex
        })
        return data
      })
  } else {
    return Q.resolve(data)
  }
}

const processAllDeletesPromise = data => {
  const deletePromises = data.listItemStrings.map(listItemString => {
    logger.log('debug', 'deletePromises_map', listItemString)
    data.listItemName = listItemString
    return listItems.deletePromise(data, listItemString)
      .catch(data => {
        if (!data.firstItemInError) {
          data.firstItemInError = listItemString
        }
        throw data
      })
  })
  return Q.all(deletePromises)
}

const processError = data => {
  if (data.errorMessage === errors.errorTypes.listItemNotFound) {
    if (data.allNumeric) {
      data.responseText =
        phrases.listItemIndexNotFound +
        data.firstItemInError +
        '.\n' + phrases.suggestEditPartOne +
        data.list +
        phrases.suggestEditPartTwo
    } else {
      data.responseText =
        phrases.listItemNotFound +
        data.firstItemInError +
        '.\n' + phrases.suggestGetPartOne +
        data.list +
        phrases.suggestGetPartTwo
    }
    logger.log('debug', 'listItemNotFound', data)
  }
  return data
}

module.exports = {
  processResponseTextPromise,
  processError
}
