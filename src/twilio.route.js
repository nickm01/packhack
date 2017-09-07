const twilio = require('twilio')
const textProcessor = require('./textprocessor')
const logger = require('winston')
const config = require('../config')
const commandTypes = require('./commandtypes')

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
  textProcessor.processTextPromise(data).then(result => {
    logger.log('info', '*** after processTextpromise', result)
    cacheListName(result, response) // TODO: Make sure this isn't the case for delete
    sendSMSResponse(result.responseText, response)
  })
}

const sendSMSResponse = (responseText, response) => {
  const twilioResponse = new twilio.TwimlResponse()
  twilioResponse.message(responseText)
  response.send(twilioResponse.toString())
}

const cacheListName = (data, response) => {
  // If there's been an error - only do NOT cache if the list name is now different
  // or if there is a delete list command
  if (data.errorMessage && data.listName !== data.cacheListName ||
      data.commandTypes === commandTypes.deleteList
  ) {
    return
  }

  // If reminder, cache the old list key
  let listName
  if (data.listName === config.remindersListKey) {
    listName = data.cacheListName
  } else {
    listName = data.listName
  }
  logger.log('info', '___twilio.route_cacheListName cache:', listName)
  response.cookie('listName', listName, {maxAge: 1000 * 60 * 60 * 72})
}

module.exports = {
  route
}
