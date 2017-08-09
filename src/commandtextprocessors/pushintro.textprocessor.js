const phrases = require('./../phrases')
const smsProcessor = require('./../smsprocessor')
const Q = require('q')

const processResponseTextPromise = (data) => {
  data.sendText = phrases.pushIntro
  return sendSms(data)
    .then(result => {
      console.log('___sendSms_then')
      data.responseText = phrases.success
      return data
    })
}

// TODO: refactor this... duplicate code
const sendSms = data => {
  console.log('___sendSms')
  console.log(data)
  const sendMultipleSmsPromises = data.phoneNumbers.map(phoneNumber => {
    console.log('---loop')
    return smsProcessor.sendSmsPromise(data, phoneNumber, data.sendText)
  })
  return Q.all(sendMultipleSmsPromises)
}

module.exports = {
  processResponseTextPromise
}
