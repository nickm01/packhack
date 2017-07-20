// const familyMembers = require('../../model/familymembers')
const phrases = require('./../phrases')
const lists = require('../../model/lists')
const listItems = require('../../model/listitems')
const supplementaryTextProcessor = require('./addreminder.supplementarytextprocessor')
var config = require('./../../config')
// const errors = require('./../errors')

// this should....
// 1. sherlock the supplementaryText
// 2. check existence of reminder list
// 3. if not, create it
// 4. create list item in reminders list (using -1 for all)
const processResponseTextPromise = data => {
  console.log('___processResponseTextPromise - addReminder')
  supplementaryTextProcessor.retrieveDateAndTitleFromSupplementaryText(data)
  // Need to switch out the intended list for reminder
  data.eventList = data.list
  data.list = config.remindersListKey
  data.listItemName =
    '@' + data.person +
    ': #' + data.eventList +
    ' ' + data.eventTitle +
    ' ' + data.eventUserDateText
  console.log(data)
  return lists.validateListExistsPromise(data)
    .catch(data => {
      // if it doesn't exist, then need to create
      // TODO: implement
      return data
    })
    .then(result => {
      return result
    })
    .then(result => {
      return listItems.saveNewPromise(result)
    })
    .then(data => {
      data.responseText = phrases.success
      return data
    })
}

module.exports = {
  processResponseTextPromise
}
