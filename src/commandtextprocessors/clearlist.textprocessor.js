const listItems = require('../../model/listitems')
const phrases = require('./../phrases')
const errors = require('./../errors')

const processResponseTextPromise = (data) => {
  console.log('clear1')
  return listItems.deletePromise(data, null)
    .then(result => {
      data.responseText = phrases.success
      return data
    })
    .catch(result => {
      if (data.errorMessage === errors.errorTypes.listItemNotFound) {
        data.responseText = phrases.listAlreadyClear
        console.log('clear2')
        return data
      } else {
        throw data
      }
    })
}

module.exports = {
  processResponseTextPromise
}
