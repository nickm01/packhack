const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoOp = require('./model/mongo')
const router = express.Router()
const twilio = require('twilio')
const cookieParser = require('cookie-parser')
const logging = require('./logging')
const textProcessor = require('./src/textprocessor')

mongoOp.intialize()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended': false}))

app.use(cookieParser())

app.set('port', (process.env.PORT || 5000))

router.get('/', (req, res) => {
  res.json({'error': false, 'message': 'available'})
})

router.route('/twilio')
  .get((req, res) => {
    console.log('----Twilio From: ' + req.query['From'] + ' Message ' + req.query['Body'])
    const bodyText = req.query['Body'].toLowerCase()
    const fromPhoneNumber = req.query['From']

    // Get Cached ListName
    var cachedListName
    if (req.cookies && req.cookies.listName) {
      cachedListName = req.cookies.listName
    }

    // MAIN LOGIC
    const data = {
      originalText: bodyText,
      cachedListName,
      fromPhoneNumber,
      now: new Date((new Date()).getTime() - 1000 * 60) // 1 minute in the past
    }
    textProcessor.processTextPromise(data).then(result => {
      console.log(result)
      cacheListName(data.list, res) // TODO: Make sure this isn't the case for delete
      sendSMSResponse(fromPhoneNumber, data.familyId, data.originalText, data.responseText, res)
    })
  })

app.use('/', router)

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})

function sendSMSResponse (phoneNumber, familyId, inMessage, outMessage, response) {
  var twilioResponse = new twilio.TwimlResponse()
  twilioResponse.message(outMessage)
  response.send(twilioResponse.toString())
  logging.log(phoneNumber, familyId, inMessage, 'response', outMessage)
}

function cacheListName (listName, response) {
  response.cookie('listName', listName, {maxAge: 1000 * 60 * 60 * 12})
}
