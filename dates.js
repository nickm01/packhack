var moment = require('moment-timezone')
var sherlock = require('./other_modules/sherlock/sherlock')

function createDateFromText (inputText) {
  var convertedToUTC = moment.tz(inputText, 'America/Chicago').tz('UTC')
  var utcDate = new Date(convertedToUTC.format())
  console.log('Converted to ' + utcDate)
  return utcDate
}

function processDateAndTitleFromText (inputText, callback) {
  var sherlocked = sherlock.parse(inputText)
  var now = new Date()
  var nowLocal = moment.tz(now).tz('America/Chicago')
  var nowLocalDate = new Date(nowLocal.format())
  sherlock._setNow(nowLocalDate)
  console.log('NOW:' + now + ' nowLocal:' + nowLocal.format() + ' nowLocalDate:' + nowLocalDate)
  if (sherlocked.startDate == null) {
    callback("Couldn't work out that time sorry. 😕", null, null)
  }
  callback(null, sherlocked.startDate, sherlocked.eventTitle)
}

module.exports = {
  createDateFromText,
  processDateAndTitleFromText
}
