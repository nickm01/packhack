var moment = require('moment-timezone')
var sherlock = require('./other_modules/sherlock/sherlock')

function processDateAndTitleFromText (inputText, zoneName, callback) {
  var rightNow = new Date()
  var nowLocalDate = convertDateToLiteralTimezoneEquivalent(rightNow, zoneName, true)
  console.log(' ----> nowLocalDate:' + nowLocalDate)

  // Process Local Date as GMT to ensure "tomorrow" is tomorrow locally
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(inputText)

  if (sherlocked.startDate == null) {
    callback("Couldn't work out that time sorry. 😕")
  } else {
    var startDateLocal = sherlocked.startDate
    console.log(' ----> sherlocked.startDate:' + startDateLocal)
    var startDateGMT = convertDateToLiteralTimezoneEquivalent(startDateLocal, zoneName, false)
    console.log(' ----> startDateGMT:' + startDateGMT)
    var userDateText = timezonedDateText(startDateLocal)
    console.log(' ----> userDateText:' + userDateText)
    console.log(' ----> sherlocked.eventTitle:' + sherlocked.eventTitle)
    callback(null, startDateGMT, userDateText, sherlocked.eventTitle)
  }
}

function convertDateToLiteralTimezoneEquivalent (date, timezoneText, reverse) {
  console.log('date: ' + date)
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
  var dateFormat = 'ddd h:mma MMM Do'
  if (date.getHours === 0 && date.getMinutes === 0) dateFormat = 'ddd MMM Do'
  var now = new Date()
  if (now.getFullYear() !== date.getFullYear()) {
    dateFormat += ', YYYY'
  }
  return moment(date).format(dateFormat)
}

module.exports = {
  processDateAndTitleFromText
}
