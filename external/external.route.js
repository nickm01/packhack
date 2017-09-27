// const logger = require('winston')
const lists = require('../model/lists')
const listItems = require('../model/listitems')

const getLists = (request, response) => {
  lists.findAllPromise({familyId: 2})
    .then(result => {
      const listNames = result.lists.map(list => {
        return {name: list.listKey}
      })
      response.json(listNames)
    })
}

const getListItems = (request, response) => {
  console.log('123')
  console.log(request.list)
  listItems.findPromise({list: request.params.list, familyId: 2})
    .then(result => {
      const listItemNames = result.listItems.map(listItem => {
        return {name: listItem.listItemName}
      })
      response.json(listItemNames)
    })
}

module.exports = {
  getLists,
  getListItems
}
