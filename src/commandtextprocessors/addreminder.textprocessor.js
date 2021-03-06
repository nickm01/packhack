// const familyMembers = require('../../model/familymembers')
const phrases = require('./../phrases')
const lists = require('../../model/lists')
const listItems = require('../../model/listitems')
const supplementaryTextProcessor = require('./addreminder.supplementarytextprocessor')
const config = require('./../../config')
const errors = require('./../errors')
const logger = require('winston')

// this should....
// 1. sherlock the supplementaryText
// 2. check existence of reminder list
// 3. if not, create it
// 4. create list item in reminders list (using -1 for all)
const processResponseTextPromise = data => {
  supplementaryTextProcessor.retrieveDateAndTitleFromSupplementaryText(data)
  if (data.reminderWhenGMT < data.now) {
    data.errorMessage = errors.errorTypes.dateTimePast
    throw data
  }
  data.reminderList = data.list
  data.list = config.remindersListKey
  data.listItemName =
    '@' + data.person + ':' +
    (data.reminderList ? ' #' + data.reminderList : '') +
    ' ' + data.reminderTitle +
    ' - ' + data.reminderUserDateText
  logger.log('debug', data)
  return lists.validateListExistsPromise(data)
    .catch(result => {
      logger.log('debug', 'catch')
      if (result.errorMessage === errors.errorTypes.listNotFound) {
        result.errorMessage = null
        return lists.saveNewPromise(result)
      } else {
        result.errorMessage = errors.errorTypes.generalError
        throw result
      }
    })
    .then(result => {
      return listItems.saveNewReminderPromise(result)
    })
    .then(data => {
      data.responseText = phrases.addReminderSuccess
      return data
    })
}

module.exports = {
  processResponseTextPromise
}
