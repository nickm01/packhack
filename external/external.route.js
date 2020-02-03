// const logger = require('winston')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const modelConstants = require('../model/modelconstants')
const smsProcessor = require('../src/smsprocessor')
const phrases = require('../src/phrases')
const logger = require('winston')
const familyMembers = require('../model/familymembers')

const errorMessages = {
  notFound: 'Not found',
  alreadyExists: 'Already exists',
  generalError: 'Error',
  invalidPhoneNumber: 'invalidPhoneNumber',
  invalidVerificationNumber: 'invalidVerificationNumber'
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

const authenticatePhone = (request, response) => {
  const phoneNumber = request.body.phone
  if (smsProcessor.validatePhoneNumber(phoneNumber) === false) {
    response.status(404).send(errorMessages.invalidPhoneNumber)
    return
  }
  const verificationNumber = Math.floor(Math.random() * 90000) + 10000
  const text = verificationNumber + phrases.verification
  let expiryDate = new Date()
  expiryDate.setDate(expiryDate.getDate() + 1);
  data = {
    fromPhoneNumber: phoneNumber,
    newVerificationNumber: verificationNumber,
    verificationNumberExpiry: expiryDate
  }

  smsProcessor.sendSmsPromise({}, phoneNumber, text)
    .then(result => {
      logger.log('info', '----authenticatePhone SMS success')
      return data
    })
    .then(familyMembers.retrievePersonFromPhoneNumberPromise)
    .catch(data => {
      if (data.errorMessage === modelConstants.errorTypes.personNotFound) {
        return data
      } else {
        throw data
      }
    })
    .then(data => {
      data.verificationNumber = data.newVerificationNumber
      if (data.errorMessage === modelConstants.errorTypes.personNotFound) {
        logger.log('info', '----authenticatePhone save new')
        return familyMembers.saveNewFamilyMemberPromise(data)
      } else {
        logger.log('info', '----authenticatePhone update')
        return familyMembers.updateFamilyMemberVerificationNumberPromise(data)
      }
    })
    .then(data => {
      logger.log('info', '----authenticatePhone update success')
      response.json({'phone': phoneNumber})
    })
    .catch(result => {
      logger.log('info', '----authenticatePhone Failure', result)
      response.status(404).send(errorMessages.invalidPhoneNumber)
    })
}

// verify phone
const verifyPhone = (request, response) => {
  const verificationNumber = request.body.verificationNumber
  const phoneNumber = request.body.phone
  logger.log('info', '----verification requested', request.body)
  if (verificationNumber.length !==5) {
    response.status(404).send(errorMessages.invalidVerificationNumber)
    return
  } else if (smsProcessor.validatePhoneNumber(phoneNumber) === false) {
    response.status(404).send(errorMessages.invalidPhoneNumber)
    return
  }
  familyMembers.retrievePersonFromPhoneNumberPromise(data)
    .catch(data => {
      data.errorMessage = errorMessages.invalidPhoneNumber
      throw data
    })
    .then(data => {
      if (data.verificationNumber !== verificationNumber) {
          logger.log('info', '----verification no match', data.verificationNumber)
          data.errorMessage = errorMessages.invalidVerificationNumber
          throw data
      }
      response.json({'verified': true})
    })
    .catch(result => {
      response.status(404).send(data.errorMessage)
    })
}

module.exports = {
  getLists,
  addList,
  deleteList,
  getListItems,
  addListItem,
  deleteListItem,
  authenticatePhone,
  verifyPhone
}
