var moment = require('moment-timezone')
var sherlock = require('./other_modules/sherlock/sherlock')

function createDateFromText (inputText) {
  var convertedToUTC = moment.tz(inputText, 'America/Chicago').tz('UTC')
  var utcDate = new Date(convertedToUTC.format())
  console.log('Converted to ' + utcDate)
  return utcDate
}

function processDateAndTitleFromText (inputText, callback) {
  var now = new Date()
  var nowLocal = moment.tz(now, 'America/Chicago')
  var nowLocalString = nowLocal.format()
  var nowLocalTrimmed = nowLocalString.substring(0, nowLocalString.length - 6)
  var nowLocalDate = new Date(nowLocalTrimmed)
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(inputText)
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
