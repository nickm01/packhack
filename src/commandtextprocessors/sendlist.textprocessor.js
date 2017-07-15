const phrases = require('./../phrases')
const smsProcessor = require('./../smsprocessor')
const getListTextProcessor = require('./getlist.textprocessor')
const finalResponseTextProcessor = require('./../finalresponsetextprocessor')
const Q = require('q')

const processResponseTextPromise = (data) => {
  console.log('rrrrra')
  return getListTextProcessor.buildListItemsText(data)
    .then(buildSendText)
    .then(sendSms)
    .then(result => {
      console.log('rrrrrb')
      data.responseText = phrases.success
      return data
    })
}

const buildSendText = data => {
  const staticText = phrases.justSent + '\n' + data.listItemsText
  console.log('staticText')
  console.log(staticText)
  data.sendText = finalResponseTextProcessor.replaceDynamicText(data, staticText)
  return data
}

const sendSms = data => {
  console.log('___sendSms')
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
