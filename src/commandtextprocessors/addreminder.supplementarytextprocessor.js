const moment = require('moment-timezone')
const sherlock = require('../../other_modules/sherlock/sherlock')
const errors = require('./../errors')

const retrieveDateAndTitleFromSupplementaryText = data => {
  console.log('___retrieveDateAndTitleFromSupplementaryText')
  const rightNow = new Date()
  const nowLocalDate = convertDateToLiteralTimezoneEquivalent(rightNow, data.timezone, true)
  console.log('Server Now:')
  console.log(nowLocalDate)

  // Process Local Date as GMT to ensure "tomorrow" is tomorrow locally
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(data.supplementaryText)

  if (sherlocked.startDate == null) {
    data.errorMessage = errors.errorTypes.noDateTime
    throw data
  } else {
    var startDateLocal = sherlocked.startDate
    console.log('sherlocked.startDate:')
    console.log(startDateLocal)
    var startDateGMT = convertDateToLiteralTimezoneEquivalent(startDateLocal, data.timezone, false)
    console.log('startDateGMT:')
    console.log(startDateGMT)
    var userDateText = timezonedDateText(startDateLocal)
    console.log('userDateText: ' + userDateText)
    console.log('sherlocked.eventTitle: ' + sherlocked.eventTitle)
    const title = sherlocked.eventTitle
    if (!title) {
      data.errorMessage = errors.errorTypes.noTitle
      throw data
    }
    data.reminderWhenGMT = startDateGMT
    data.reminderUserDateText = userDateText
    data.reminderTitle = title.trim()
    return data
  }
}

const convertDateToLiteralTimezoneEquivalent = (date, timezoneText, reverse) => {
  var nowTimezone = moment.tz(date, timezoneText)
  // var nowTimezone = moment.tz(date, 'GMT')
  var timezoneOffsetString = nowTimezone.format('Z')
  if (reverse === true) {
    timezoneOffsetString = reverseTimezoneOffset(timezoneOffsetString)
  }
  console.log('timezoneOffsetString: ' + timezoneOffsetString)
  var now = moment(date)
  now.utcOffset(timezoneOffsetString, true)
  return now.toDate()
}

const reverseTimezoneOffset = timezoneOffsetString => {
  var firstCharacter = timezoneOffsetString.substr(0, 1)
  if (firstCharacter === '-') {
    firstCharacter = '+'
  } else if (firstCharacter === '+') {
    firstCharacter = '-'
  }
  return firstCharacter + timezoneOffsetString.substr(1)
}

const timezonedDateText = date => {
  var dateFormat = 'dddd h:mma, MMM Do'
  if (date.getMinutes() === 0) {
    if (date.getHours() === 0) {
      dateFormat = dateFormat.replace(' h:mma', '')
    } else {
      dateFormat = dateFormat.replace(':mm', '')
    }
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
