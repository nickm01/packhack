// const logger = require('winston')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const modelConstants = require('../model/modelconstants')
const smsProcessor = require('../src/smsprocessor')
const phrases = require('../src/phrases')
const logger = require('winston')
const familyMembers = require('../model/familymembers')
const jwt = require('jsonwebtoken')

const errorMessages = {
  notFound: { errorCode: 1001, errorMessage: 'not found' },
  alreadyExists: { errorCode: 1002, errorMessage: 'already exists' },
  generalError: { errorCode: 1000, errorMessage: 'error' },
  invalidPhoneNumber: { errorCode: 1003, errorMessage: 'invalid phone number' },
  invalidVerificationNumber: { errorCode: 1004, errorMessage: 'invalid verification number' },
  tokenRequired: { errorCode: 1005, errorMessage: 'token required' },
  tokenVerificationFailure: { errorCode: 1006, errorMessage: 'token verification failed' },
  expiredVerificationNumber: { errorCode: 1007, errorMessage: 'expired verification number' }
}

const issuer = 'https://packhack.us'

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
    response.status(404).send({error: errorMessages.invalidPhoneNumber})
    return
  }
  const newVerificationNumber = Math.floor(Math.random() * 90000) + 10000
  const text = newVerificationNumber + phrases.verification

  // Verification expiry - now + 5 minutes
  let expiryDate = new Date()
  expiryDate.setMinutes(expiryDate.getMinutes() + 5)
  expiryDate = new Date(expiryDate)

  let data = {
    fromPhoneNumber: phoneNumber
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
      data.verificationNumber = newVerificationNumber
      data.verificationNumberExpiry = expiryDate
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
    .catch(data => {
      logger.log('info', '----authenticatePhone Failure', data)
      response.status(404).send(errorMessages.invalidPhoneNumber)
    })
}

// verify phone
const verifyPhone = (request, response) => {
  const verificationNumber = request.query.verificationNumber
  const phoneNumber = request.query.phone
  let data = {
    fromPhoneNumber: phoneNumber
  }
  logger.log('info', '----verification requested', request.query)
  if (!verificationNumber || verificationNumber.length !== 5) {
    response.status(404).send(errorMessages.invalidVerificationNumber)
    return
  } else if (!phoneNumber || smsProcessor.validatePhoneNumber(phoneNumber) === false) {
    response.status(404).send(errorMessages.invalidPhoneNumber)
    return
  }
  familyMembers.retrievePersonFromPhoneNumberPromise(data)
    .catch(data => {
      data.errorMessage = errorMessages.invalidPhoneNumber
      throw data
    })
    .then(data => {
      if (data.verificationNumber !== parseInt(verificationNumber)) {
        logger.log('info', '----verification no match', data.verificationNumber)
        data.errorMessage = errorMessages.invalidVerificationNumber
        throw data
      }
      if (new Date(data.verificationNumberExpiry) < new Date()) {
        logger.log('info', '----verification expired', data.verificationNumberExpiry)
        data.errorMessage = errorMessages.expiredVerificationNumber
        throw data
      }
      const payload = {phone: phoneNumber}
      const options = {expiresIn: '1y', issuer: issuer}
      const secret = process.env.JWT_SECRET
      const token = jwt.sign(payload, secret, options)
      logger.log('debug', '----verification token', token)
      response.json({'token': token})
    })
    .catch(data => {
      response.status(404).send(data.errorMessage) // ?? Test
    })
}

const validateToken = (request, response, next) => {
  const authorizationHeaader = request.headers.authorization
  let result
  if (authorizationHeaader) {
    const token = request.headers.authorization
    const options = {
      expiresIn: '1y',
      issuer: issuer
    }
    try {
      result = jwt.verify(token, process.env.JWT_SECRET, options)
      request.decoded = result
      // We call next to pass execution to the subsequent middleware
      next()
    } catch (err) {
      logger.log('info', '----verification token invalid', err)
      response.status(401).send(errorMessages.tokenVerificationFailure)
    }
  } else {
    logger.log('info', '----verification token required')
    response.status(401).send(errorMessages.tokenRequired)
  }
}

// TODO: Remove verification number, add verification expiry checking (why isn't it being returned?)
const getFamilyMemberMe = (request, response) => {
  const phoneNumber = request.decoded.phone
  let data = {
    fromPhoneNumber: phoneNumber
  }
  familyMembers.retrievePersonFromPhoneNumberPromise(data)
    .then(data => {
      response.json({familyMember: data})
    })
    .catch(data => {
      logger.log('info', '----authenticatePhone Failure', data)
      response.status(404).send(errorMessages.invalidPhoneNumber)
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
  verifyPhone,
  validateToken,
  getFamilyMemberMe
}
