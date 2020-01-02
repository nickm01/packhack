const config = require('../config')
const client = require('twilio')(config.accountSid, config.authToken)
const errors = require('./errors')
const logger = require('winston')

const sendSmsPromise = (data, to, message) => {
  logger.log('debug', '__smsprocessor_sendSmsPromise1', message)
  const params = {body: message, to: to, from: config.sendingNumber}
  return client.messages.create(params)
    .then(result => {
      logger.log('debug', '__smsprocessor_sendSmsPromise2', result)
      return data
    }, err => {
      logger.log('info', '__smsprocessor_sendSmsPromise_err', err)
      data.systemError = err
      data.errorMessage = errors.errorTypes.smsError
      throw data
    })
}

// for now, this is american format +14445556666 only
const validatePhoneNumber = (phone) => {
  if (
    phone.length === 12 &&
    phone.charAt(0) === '+' &&
    phone.charAt(1) === '1' &&
    /^\d+$/.test(phone.substr(1)) === true) {
    return true
  } else {
    return false
  }
}

module.exports = {
  sendSmsPromise,
  validatePhoneNumber
}
