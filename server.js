const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const mongoOp = require('./model/mongo')
const router = express.Router()
const cookieParser = require('cookie-parser')
const twilioRoute = require('./src/twilio.route')
const externalRoute = require('./external/external.route')
const logger = require('winston')

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

// External API Routes
// API Design based on https://hackernoon.com/restful-api-design-with-node-js-26ccf66eab09
router.route('/api/lists').get((request, response) => { externalRoute.getLists(request, response) })
router.route('/api/lists/:list').get((request, response) => { externalRoute.getListItems(request, response) })
router.route('/api/lists/:list').delete((request, response) => { externalRoute.deleteList(request, response) })
// TODO: Need to add /items on the end of these 2
router.route('/api/lists/:list').post((request, response) => { externalRoute.addListItem(request, response) })
router.route('/api/lists/:list/items/:item').delete((request, response) => { externalRoute.deleteListItem(request, response) })
router.route('/api/lists/:list/items').delete((request, response) => { externalRoute.deleteListItem(request, response) })

app.use('/', router)

app.listen(app.get('port'), () => {
  logger.log('info', '*** Node app is running on port', app.get('port'))
})
