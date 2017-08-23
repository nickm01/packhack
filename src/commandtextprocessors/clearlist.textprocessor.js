const listItems = require('../../model/listitems')
const phrases = require('./../phrases')
const errors = require('./../errors')
const logger = require('winston')

const processResponseTextPromise = (data) => {
  return listItems.deletePromise(data, null)
    .then(result => {
      data.responseText = phrases.success
      return data
    })
    .catch(result => {
      if (data.errorMessage === errors.errorTypes.listItemNotFound) {
        data.responseText = phrases.listAlreadyClear
        logger.log('debug', 'listItemNotFound')
        return data
      } else {
        throw data
      }
    })
}

module.exports = {
  processResponseTextPromise
}
