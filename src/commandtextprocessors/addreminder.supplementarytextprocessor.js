var moment = require('moment-timezone')
var sherlock = require('../../other_modules/sherlock/sherlock')
const errors = require('./../errors')

// Inject rightNow for testing purposes
function retrieveDateAndTitleFromSupplementaryText (data, rightNow) {
  var nowLocalDate = convertDateToLiteralTimezoneEquivalent(rightNow, data.timezone, true)
  console.log(' ----> nowLocalDate:' + nowLocalDate)

  // Process Local Date as GMT to ensure "tomorrow" is tomorrow locally
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(data.supplementaryText)

  if (sherlocked.startDate == null) {
    data.errorMessage = errors.errorTypes.noDateTime
    return data
  } else {
    var startDateLocal = sherlocked.startDate
    console.log(' ----> sherlocked.startDate:' + startDateLocal)
    var startDateGMT = convertDateToLiteralTimezoneEquivalent(startDateLocal, data.timezone, false)
    console.log(' ----> startDateGMT:' + startDateGMT)
    var userDateText = timezonedDateText(startDateLocal)
    console.log(' ----> userDateText:' + userDateText)
    console.log(' ----> sherlocked.eventTitle:' + sherlocked.eventTitle)
    data.eventStartDateGMT = startDateGMT
    data.eventUserDateText = userDateText
    data.eventTitle = sherlocked.eventTitle
    return data
  }
}

function convertDateToLiteralTimezoneEquivalent (date, timezoneText, reverse) {
  console.log('1: date: ' + date)
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
  var dateFormat = 'dddd h:mma, MMM Do'
  if (date.getHours() === 0 && date.getMinutes() === 0) {
    dateFormat = 'dddd, MMM Do'
  }
  // Note this isn't timezone friendly but so broad it doesn't make a difference
  var now = new Date()
  if (now.getFullYear() !== date.getFullYear()) {
    dateFormat += ', YYYY'
  }
  return moment(date).format(dateFormat)
}

module.exports = {
  retrieveDateAndTitleFromSupplementaryText
}
