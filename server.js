const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoOp = require('./model/mongo')
const router = express.Router()
const cookieParser = require('cookie-parser')
const twilioRoute = require('./src/twilio.route')

mongoOp.intialize()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({'extended': false}))

app.use(cookieParser())

app.set('port', (process.env.PORT || 5000))

router.get('/', (req, res) => {
  res.json({'error': false, 'message': 'available'})
})

router.route('/twilio')
  .get((request, response) => {
    twilioRoute.route(request, response)
  })

app.use('/', router)

app.listen(app.get('port'), () => {
  console.log('Node app is running on port', app.get('port'))
})
