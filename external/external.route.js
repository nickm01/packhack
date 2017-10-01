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
  listItems.findPromise({list: request.params.list, familyId: 2})
    .then(result => {
      const listItemNames = result.listItems.map(listItem => {
        return {name: listItem.listItemName}
      })
      response.json(listItemNames)
    })
}

const addListItem = (request, response) => {
  let listItemName = request.body.name
  listItems.saveNewPromise({list: request.params.list, familyId: 2, listItemName: listItemName})
    .then(result => {
      response.json({name: listItemName})
    })
}

module.exports = {
  getLists,
  getListItems,
  addListItem
}
