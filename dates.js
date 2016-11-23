var moment = require('moment-timezone')
var sherlock = require('./other_modules/sherlock/sherlock')

function processDateAndTitleFromText (inputText, zoneName, callback) {
  var nowLocalDate = convertDateToLiteralTimezoneEquivalent(new Date(), zoneName, false)
  console.log(' ----> nowLocalDate:' + nowLocalDate)

  // Process Local Date as GMT to ensure "tomorrow" is tomorrow locally
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(inputText)

  if (sherlocked.startDate == null) {
    callback("Couldn't work out that time sorry. 😕")
  } else {
    var startDateLocal = sherlocked.startDate
    console.log(' ----> sherlocked.startDate:' + startDateLocal)
    var startDateGMT = convertDateToLiteralTimezoneEquivalent(startDateLocal, zoneName, true)
    console.log(' ----> startDateGMT:' + startDateGMT)
    var userDateText = timezonedDateText(startDateLocal)
    console.log(' ----> userDateText:' + userDateText)
    callback(null, startDateGMT, userDateText, sherlocked.eventTitle)
  }
}

function convertDateToLiteralTimezoneEquivalent (date, timezoneText, reverse) {
  var nowTimezone = moment.tz(date, timezoneText)
  var timezoneOffsetString = nowTimezone.format('Z')
  if (reverse === true) {
    timezoneOffsetString = reverseTimezoneOffset(timezoneOffsetString)
  }
  console.log('timezoneOffsetString: ' + timezoneOffsetString)
  var now = moment(date)
  console.log('now: ' + now.toDate())
  now.utcOffset(timezoneOffsetString, true)
  console.log('now: ' + now.toDate())
  return now.toDate()
}

function reverseTimezoneOffset (timezoneOffsetString) {
  var firstCharacter = timezoneOffsetString.substr(0, 1)
  if (firstCharacter === '-') {
    firstCharacter = '+'
  } else if (firstCharacter === '+') {
    firstCharacter = '-'
  }
  return firstCharacter + timezoneOffsetString.substr(1)
}

function timezonedDateText (date) {
  return moment(date).format('MMM DD YYYY ddd h:mma')
}

module.exports = {
  processDateAndTitleFromText
}
