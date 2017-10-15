const moment = require('moment-timezone')
const sherlock = require('../../other_modules/sherlock/sherlock')
const errors = require('./../errors')
const logger = require('winston')

const retrieveDateAndTitleFromSupplementaryText = data => {
  const rightNow = new Date()
  const nowLocalDate = convertDateToLiteralTimezoneEquivalent(rightNow, data.timezone, true)
  logger.log('debug', 'Server Now:', nowLocalDate)

  // Process Local Date as GMT to ensure "tomorrow" is tomorrow locally
  sherlock._setNow(nowLocalDate)
  var sherlocked = sherlock.parse(data.supplementaryText)

  if (sherlocked.startDate == null) {
    data.errorMessage = errors.errorTypes.noDateTime
    throw data
  } else {
    var startDateLocal = sherlocked.startDate
    logger.log('debug', 'sherlocked.startDate:', startDateLocal)
    var startDateGMT = convertDateToLiteralTimezoneEquivalent(startDateLocal, data.timezone, false)
    logger.log('debug', 'startDateGMT:', startDateGMT)
    var userDateText = timezonedDateText(startDateLocal)
    logger.log('debug', 'userDateText: ' + userDateText)
    logger.log('debug', 'sherlocked.eventTitle: ' + sherlocked.eventTitle)
    let title = sherlocked.eventTitle
    if (!title) {
      data.errorMessage = errors.errorTypes.noTitle
      throw data
    }
    if (title.length > 3 && title.substring(0, 3) === 'to ') {
      title = title.substring(3)
    }
    console.log(' ***** ' + title)
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
  logger.log('debug', 'timezoneOffsetString: ' + timezoneOffsetString)
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
