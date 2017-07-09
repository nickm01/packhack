const listItems = require('../../model/listitems')
const phrases = require('./../phrases')
const stringProcessor = require('./../stringprocessor')
const Q = require('q')
const errors = require('./../errors')

const processResponseTextPromise = (data) => {
  console.log('666-delete')
  console.log(data)
  const listItemStrings = stringProcessor.splitByCommasAndsDoubleSpaces(data.supplementaryText)
  console.log(listItemStrings)
  if (listItemStrings.length === 0) {
    data.responseText = phrases.noListItemToRemove + '\n' + phrases.removeListItemExample
    return Q.reject(data)
  }
  const deletePromises = listItemStrings.map(listItemString => {
    data.listItemName = listItemString
    console.log('xxxxxxx')
    console.log(listItemString)
    return listItems.deletePromise(data, listItemString)
      .catch(data => {
        if (!data.firstItemInError) {
          data.firstItemInError = listItemString
        }
        throw data
      })
  })
  return Q.all(deletePromises).then(result => {
    data.responseText = phrases.success
    return data
  })
}

const processError = (data) => {
  if (data.errorMessage === errors.errorTypes.listItemNotFound) {
    console.log('x2-processerror')
    data.responseText =
      phrases.listItemNotFound +
      data.firstItemInError +
      '.\n' + phrases.suggestGetPartOne +
      data.list +
      phrases.suggestGetPartTwo
    console.log(data)
  }
  return data
}
module.exports = {
  processResponseTextPromise,
  processError
}
