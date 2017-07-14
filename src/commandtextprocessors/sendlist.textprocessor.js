// const familyMembers = require('../../model/familymembers')
const phrases = require('./../phrases')
const smsProcessor = require('./../smsprocessor')
// const errors = require('./../errors')

const processResponseTextPromise = (data) => {
  console.log('rrrrra')
  return sendSms(data)
    .then(result => {
      console.log('rrrrrb')
      data.responseText = phrases.success
      return data
    })
    // .catch(result => {
    //   if (data.errorMessage === errors.errorTypes.listItemNotFound) {
    //     data.responseText = phrases.listAlreadyClear
    //     console.log('clear2')
    //     return data
    //   } else {
    //     throw data
    //   }
    // })
}

const sendSms = data => {
  console.log('sendSms')
  return smsProcessor.sendSmsPromise(data, data.phoneNumbers[0], 'hello')
}

module.exports = {
  processResponseTextPromise
}
