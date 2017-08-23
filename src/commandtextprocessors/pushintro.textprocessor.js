const phrases = require('./../phrases')
const smsProcessor = require('./../smsprocessor')
const Q = require('q')
const logger = require('winston')

const processResponseTextPromise = (data) => {
  data.sendText = phrases.pushIntro
  return sendSms(data)
    .then(result => {
      data.responseText = phrases.success
      return data
    })
}

// TODO: refactor this... duplicate code
const sendSms = data => {
  logger.log('debug', '___pushintro.textprocessor_sendSms', data)
  const sendMultipleSmsPromises = data.phoneNumbers.map(phoneNumber => {
    logger.log('debug', 'loop')
    return smsProcessor.sendSmsPromise(data, phoneNumber, data.sendText)
  })
  return Q.all(sendMultipleSmsPromises)
}

module.exports = {
  processResponseTextPromise
}
