var config = require('../config')
var client = require('twilio')(config.accountSid, config.authToken)
var Q = require('q')

module.exports.sendSmsPromise = function (data, to, message) {
  const deferred = Q.deferred
  client.messages.create({body: message, to: to, from: config.sendingNumber}, (err, data) => {
    if (err) {
      data.systemError = err
      deferred.reject(data)
    } else {
      deferred.resolve(data)
    }
  })
  return deferred
}
