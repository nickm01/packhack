const phrases = require('./../phrases')
const smsProcessor = require('./../smsprocessor')
const getListTextProcessor = require('./getlist.textprocessor')
const finalResponseTextProcessor = require('./../finalresponsetextprocessor')
const Q = require('q')
const logger = require('winston')

const processResponseTextPromise = (data) => {
  return getListTextProcessor.buildListItemsText(data)
    .then(buildSendText)
    .then(sendSms)
    .then(result => {
      logger.log('debug', 'finalthen')
      data.responseText = phrases.success
      return data
    })
}

const buildSendText = data => {
  const staticText = phrases.justSent + '\n' + data.listItemsText
  logger.log('debug', 'staticText', staticText)
  data.sendText = finalResponseTextProcessor.replaceDynamicText(data, staticText)
  return data
}

const sendSms = data => {
  logger.log('debug', 'sendSms')
  // remove the persons own phone number only if multiples (using @all)
  const otherPhoneNumbers = data.phoneNumbers.filter(phoneNumber => {
    return phoneNumber !== data.fromPhoneNumber || data.phoneNumbers.length === 1
  })
  const sendMultipleSmsPromises = otherPhoneNumbers.map(phoneNumber => {
    return smsProcessor.sendSmsPromise(data, phoneNumber, data.sendText)
  })
  return Q.all(sendMultipleSmsPromises)
}

module.exports = {
  processResponseTextPromise
}
