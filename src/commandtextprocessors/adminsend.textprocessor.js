const phrases = require('./../phrases')
const smsProcessor = require('./../smsprocessor')
const stringProcessor = require('./../stringprocessor')
const Q = require('q')
const logger = require('winston')

const processResponseTextPromise = (data) => {
  data.sendText = stringProcessor.stringToWords(data.supplementaryText).splice(1).join(' ')
  return sendSms(data)
    .then(result => {
      data.responseText = phrases.success
      return data
    })
}

// TODO: refactor this... duplicate code
const sendSms = data => {
  logger.log('debug', '___.textprocessor_sendSms', data)
  const sendMultipleSmsPromises = data.phoneNumbers.map(phoneNumber => {
    logger.log('debug', 'loop')
    return smsProcessor.sendSmsPromise(data, phoneNumber, data.sendText)
  })
  return Q.all(sendMultipleSmsPromises)
}

module.exports = {
  processResponseTextPromise
}
