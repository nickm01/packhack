var moment = require('moment-timezone')
var sherlock = require('./other_modules/sherlock/sherlock')

function createDateFromText (inputText) {
  var convertedToUTC = moment.tz(inputText, 'America/Chicago').tz('UTC')
  var utcDate = new Date(convertedToUTC.format())
  console.log('Converted to ' + utcDate)
  return utcDate
}

function processDateAndTitleFromText (inputText, callback) {
  // Take the current date in GMT and make it the literal same date/time in local timzone
  // This is so that sherlock will work OK
  // var now = new Date()
  // var nowLocal = moment.tz(now, 'America/Chicago')
  // var nowLocalString = nowLocal.format()
  // var nowLocalTrimmed = nowLocalString.substring(0, nowLocalString.length - 6)
  var zoneName = 'America/Chicago'
  var nowLocalDate = convertDateToLiteralTimezoneEquivalent(new Date(), zoneName, false)
  console.log(' ----> nowLocalDate:' + nowLocalDate)
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(inputText)
  // var startDateString = '' + sherlocked.startDate
  // var startDateReported = startDateString.substring(0, startDateString.length - 15)
  // var startDateTrimmed = startDateReported + ' GMT-06:00 (UTC)'
  // var startDateLocal = moment(startDateTrimmed)
  // var startDateGMT = new Date(startDateLocal)
  // console.log('startDateTrimmed:' + startDateTrimmed + ' startDateLocal:' + startDateLocal.format() + ' startDateGMT:' + startDateGMT)
  if (sherlocked.startDate == null) {
    callback("Couldn't work out that time sorry. 😕", null, null)
  } else {
    console.log(' ----> sherlocked.startDate:' + sherlocked.startDate)
    var startDateGMT = convertDateToLiteralTimezoneEquivalent(sherlocked.startDate, zoneName, true)
    console.log(' ----> startDateGMT:' + startDateGMT)
    var userDateText = timezonedDateText(sherlocked.startDate)
    console.log(' ----> userDateText:' + userDateText)
    callback(null, startDateGMT, sherlocked.eventTitle + ' @ ' + userDateText)
  }
}

// function convertDateToLiteralTimezoneEquivalent (date, timezoneText) {
//   var nowLocal = moment.tz(date, timezoneText)
//   var nowLocalString = nowLocal.format()
//   var nowLocalTrimmed = nowLocalString.substring(0, nowLocalString.length - 6)
//   return new Date(nowLocalTrimmed)
// }

function convertDateToLiteralTimezoneEquivalent (date, timezoneText, reverse) {
  var nowTimezone = moment.tz(date, timezoneText)
  var timezoneOffsetString = nowTimezone.format('Z')
  console.log('timezoneOffsetString: ' + timezoneOffsetString)
  if (reverse === true) {
    var firstCharacter = timezoneOffsetString.substr(0, 1)
    if (firstCharacter === '-') {
      firstCharacter = '+'
    } else if (firstCharacter === '+') {
      firstCharacter = '-'
    }
    timezoneOffsetString = firstCharacter + timezoneOffsetString.substr(1)
  }
  console.log('timezoneOffsetString: ' + timezoneOffsetString)
  var now = moment(date)
  console.log('now1: ' + now)
  now.utcOffset(timezoneOffsetString, true)
  console.log('now2: ' + now)
  return now.toDate()
}

function timezonedDateText (date) {
  return moment(date).format('MMM DD YYYY ddd h:mma')
}

module.exports = {
  createDateFromText,
  processDateAndTitleFromText
}
