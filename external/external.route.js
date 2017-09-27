const logger = require('winston')

const route = (request, response) => {
  logger.log('info', request)
  response.json({
    hello: '123',
    goodbye: 'abc'
  })
}

module.exports = {
  route
}
