// const logger = require('winston')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const modelConstants = require('../model/modelconstants')
const smsProcessor = require('../src/smsprocessor')
const phrases = require('../src/phrases')
const logger = require('winston')

const errorMessages = {
  notFound: 'Not found',
  alreadyExists: 'Already exists',
  generalError: 'Error'
}

const getLists = (request, response) => {
  lists.findAllPromise({familyId: 2})
    .then(result => {
      const listNames = result.lists.map(list => {
        return {name: list.listKey}
      })
      response.json(listNames)
    }, result => {
      response.status(404).send(errorMessages.generalError)
    }
  )
}

const addList = (request, response) => {
  let list = request.body.name
  lists.saveNewPromise({list, familyId: 2})
    .then(result => {
      response.json({name: list})
    }, result => {
      if (result.errorMessage === modelConstants.errorTypes.duplicateList) {
        response.status(409).send(errorMessages.alreadyExists)
      } else {
        response.status(404).send(errorMessages.generalError)
      }
    }
  )
}

const deleteList = (request, response) => {
  let list = request.params.list
  lists.deletePromise({list, familyId: 2})
    .then(result => {
      response.json({name: list})
    }, result => {
      if (result.errorMessage === modelConstants.errorTypes.listNotFound) {
        response.status(404).send(errorMessages.notFound)
      } else {
        response.status(404).send(errorMessages.generalError)
      }
    }
  )
}

const getListItems = (request, response) => {
  listItems.findPromise({list: request.params.list, familyId: 2})
    .then(result => {
      const listItemNames = result.listItems.map(listItem => {
        return {name: listItem.listItemName}
      })
      response.json(listItemNames)
    }, result => {
      response.status(404).send(errorMessages.generalError)
    }
  )
}

const addListItem = (request, response) => {
  let listItemName = request.body.name
  // TODO: deal with duplicates
  listItems.saveNewPromise({list: request.params.list, familyId: 2, listItemName: listItemName})
    .then(result => {
      response.json({name: listItemName})
    }, result => {
      if (result.errorMessage === modelConstants.errorTypes.duplicateListItem) {
        response.status(409).send(errorMessages.alreadyExists)
      } else {
        response.status(404).send(errorMessages.generalError)
      }
    }
  )
}

// Can handle delete and clear (delete all)
const deleteListItem = (request, response) => {
  let listItemName = request.params.item
  listItems.deletePromise({list: request.params.list, familyId: 2}, listItemName)
    .then(result => {
      response.json({name: listItemName})
    }, result => {
      if (result.errorMessage === modelConstants.errorTypes.listItemNotFound) {
        response.status(404).send(errorMessages.notFound)
      } else {
        response.status(404).send(errorMessages.generalError)
      }
    })
}

// Can handle delete and clear (delete all)
const authenticatePhone = (request, response) => {
  const phoneNumber = request.body.phone
  const verificationNumber = Math.floor(Math.random() * 90000) + 10000
  const text = verificationNumber + phrases.verification
  logger.log('info', '----authenticatePhone ' + text + ' ' + phoneNumber)
  logger.log('info', request)
  smsProcessor.sendSmsPromise({}, phoneNumber, text)
    .then(() => {
      logger.log('info', '----authenticatePhone success')
      response.json({'phone': phoneNumber})
    })
}

module.exports = {
  getLists,
  addList,
  deleteList,
  getListItems,
  addListItem,
  deleteListItem,
  authenticatePhone
}
