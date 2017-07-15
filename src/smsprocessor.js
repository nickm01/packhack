var config = require('../config')
var client = require('twilio')(config.accountSid, config.authToken)
var Q = require('q')

module.exports.sendSmsPromise = function (data, to, message) {
  const deferred = Q.defer()
  console.log('smsprocessor1')
  client.messages.create({body: message, to: to, from: config.sendingNumber}, (err, data) => {
    if (err) {
      console.log('smsprocessor2')
      data.systemError = err
      deferred.reject(data)
    } else {
      console.log('smsprocessor3')
      deferred.resolve(data)
    }
  })
  if (deferred.then) { console.log('smsprocessor-then-exists') }
  return deferred
}
