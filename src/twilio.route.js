const twilio = require('twilio')
const textProcessor = require('./textprocessor')
const logger = require('winston')
const commandTypes = require('./commandtypes')
const logs = require('../model/logs')
const smsProcessor = require('./smsprocessor')
const config = require('../config')

const route = (request, response) => {
  const bodyText = request.query['Body'].toLowerCase()
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
  logger.log('info', '___twilio.route_smsLoggingNo: ' + config.smsLoggingPhoneNumber)
  if (config.smsLoggingPhoneNumber) {
    logger.log('info', '___twilio.route_smsLoggingNo2')
    console.log('hello1')
    const sendText = 'LOG:' + data.familyId + ',' + data.fromPerson + ': ' + data.originalText + ' > ' + data.responseText
    console.log('hello2')
    logger.log('info', '___twilio.route_smsLogging: ' + sendText)
    console.log(sendText)
    return smsProcessor.sendSmsPromise(data, config.smsLoggingPhoneNumber, sendText)
  }
}

module.exports = {
  route
}
