var config = require('../config')
var client = require('twilio')(config.accountSid, config.authToken)
const errors = require('./errors')
const logger = require('winston')

module.exports.sendSmsPromise = function (data, to, message) {
  logger.log('debug', '__smsprocessor_sendSmsPromise1', message)
  const params = {body: message, to: to, from: config.sendingNumber}
  return client.messages.create(params)
    .then(result => {
      logger.log('debug', '__smsprocessor_sendSmsPromise2', result)
      return data
    }, err => {
      logger.log('debug', '__smsprocessor_sendSmsPromise_err', err)
      data.systemError = err
      data.errorMessage = errors.errorTypes.smsError
      throw data
    })
}
