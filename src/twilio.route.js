const twilio = require('twilio')
const textProcessor = require('./textprocessor')
const logger = require('winston')

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
    logger.log('info', '*** after processTextpromise', result) // TODO: Better Logging
    cacheListName(result.list, response) // TODO: Make sure this isn't the case for delete
    sendSMSResponse(result.responseText, response)
  })
}

const sendSMSResponse = (responseText, response) => {
  var twilioResponse = new twilio.TwimlResponse()
  twilioResponse.message(responseText)
  response.send(twilioResponse.toString())
}

const cacheListName = (listName, response) => {
  response.cookie('listName', listName, {maxAge: 1000 * 60 * 60 * 12})
}

module.exports = {
  route
}
