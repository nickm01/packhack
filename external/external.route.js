const logger = require('winston')
const listItems = require('../model/listitems')

const route = (request, response) => {
  logger.log('info', request)
  const data = {
    list: 'shopping',
    familyId: 2
  }
  listItems.findPromise(data)
    .then(result => {
      const listItemNames = result.listItems.map(listItem => {
        return {listItem: listItem.listItemName}
      })
      response.json(listItemNames)
    })
}

module.exports = {
  route
}
