// const logger = require('winston')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const modelConstants = require('../model/modelconstants')

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
  // TODO: deal with duplicates
  listItems.saveNewPromise({list: request.params.list, familyId: 2, listItemName: listItemName})
    .then(result => {
      // TODO: respond with 201
      response.json({name: listItemName})
    })
}

// Can handle delete and clear (delete all)
const deleteListItem = (request, response) => {
  let listItemName = request.params.item
  console.log('***** deleteListItem')
  listItems.deletePromise({list: request.params.list, familyId: 2}, listItemName)
    .then(result => {
      response.json({name: listItemName})
    }, result => {
      if (result.errorMessage === modelConstants.errorTypes.listItemNotFound) {
        response.status(404).send('Not found')
      } else {
        response.status(500).send('Error')
      }
    })
}

module.exports = {
  getLists,
  getListItems,
  addListItem,
  deleteListItem
}
