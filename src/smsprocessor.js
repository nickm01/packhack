var config = require('../config')
var client = require('twilio')(config.accountSid, config.authToken)
// var Q = require('q')

module.exports.sendSmsPromise = function (data, to, message) {
  console.log('smsprocessor1')
  return client.messages.create({body: message, to: to, from: config.sendingNumber})
    .then(result => {
      console.log('smsprocessor2')
      console.log(result)
      return data
    }, err => {
      console.log('smsprocessor3')
      console.log(err)
      data.systemError = err
      throw data
    })
}
