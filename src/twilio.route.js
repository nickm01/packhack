const twilio = require('twilio')
const textProcessor = require('./textprocessor')
const logger = require('winston')
const commandTypes = require('./commandtypes')
const logs = require('../model/logs')
const smsProcessor = require('./smsprocessor')
const config = require('../config')

const route = (request, response) => {
  const bodyTextCased = request.query['Body']
  const bodyText = bodyTextCased.toLowerCase()
  const fromPhoneNumber = request.query['From']
  logger.log('info', '*** Twilio From:' + fromPhoneNumber + ' Message:' + bodyText)

  // Get Cached ListName
  let cachedListName
  if (request.cookies && request.cookies.listName) {
    cachedListName = request.cookies.listName
  }

  // MAIN LOGIC
  const data = {
    originalText: bodyText,
    originalTextCased: bodyTextCased,
    cachedListName,
    fromPhoneNumber,
    now: new Date((new Date()).getTime() - 1000 * 60) // 1 minute in the past
  }
  logs.saveNewPromise(data)
    .then(textProcessor.processTextPromise)
    .then(logs.saveNewPromise)
    .then(result => {
      logger.log('info', '*** after processTextpromise', result)
      cacheListName(result, response) // TODO: Make sure this isn't the case for delete
      sendSMSResponse(result.responseText, response)
      return result
    })
    .then(smsLogging)
}

const sendSMSResponse = (responseText, response) => {
  const twilioResponse = new twilio.TwimlResponse()
  twilioResponse.message(responseText)
  response.send(twilioResponse.toString())
}

const cacheListName = (data, response) => {
  // If there's been an error and list name is now different or if delete list command then expire the cookie
  if ((data.errorMessage && data.list !== data.cacheListName) ||
      data.command === commandTypes.deleteList
  ) {
    logger.log('info', '___twilio.route_cacheListName expire cache')
    response.cookie('listName', '', {expires: new Date(0)})
  } else {
    logger.log('info', '___twilio.route_cacheListName cache:', data.list)
    response.cookie('listName', data.list, {maxAge: 1000 * 60 * 60 * 72})
  }
}

const smsLogging = (data) => {
  if (config.smsLoggingPhoneNumber && config.smsLoggingPhoneNumber !== data.fromPhoneNumber) {
    const sendText = 'LOG:' + data.familyId + ',' + data.fromPerson + ': ' + data.originalText + ' > ' + data.responseText
    logger.log('info', '___twilio.route_smsLogging')
    return smsProcessor.sendSmsPromise(data, config.smsLoggingPhoneNumber, sendText)
  }
}

module.exports = {
  route
}
