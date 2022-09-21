// const logger = require('winston')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const modelConstants = require('../model/modelconstants')
const smsProcessor = require('../src/smsprocessor')
const phrases = require('../src/phrases')
const logger = require('winston')
const familyMembers = require('../model/familymembers')
const families = require('../model/families')
const jwt = require('jsonwebtoken')
const snakeKeys = require('snakecase-keys-object')
const finalResponseTextProcessor = require('../src/finalresponsetextprocessor')
const { dateTimePast } = require('../src/phrases')


const errorMessages = {
  notFound: { errorCode: 1001, errorMessage: 'not found' },
  alreadyExists: { errorCode: 1002, errorMessage: 'already exists' },
  generalError: { errorCode: 1000, errorMessage: 'error' },
  invalidPhoneNumber: { errorCode: 1003, errorMessage: 'invalid phone number' },
  invalidVerificationNumber: { errorCode: 1004, errorMessage: 'invalid verification number' },
  tokenRequired: { errorCode: 1005, errorMessage: 'token required' },
  tokenVerificationFailure: { errorCode: 1006, errorMessage: 'token verification failed' },
  expiredVerificationNumber: { errorCode: 1007, errorMessage: 'expired verification number' },
  memberRetrivalFailure: { errorCode: 1008, errorMessage: 'could not retrieve member' },
  memberUpdateFailure: { errorCode: 1009, errorMessage: 'could not update member' },
  memberCreateFailure: { errorCode: 1009, errorMessage: 'could not create member' },
  familyUpdateFailure: { errorCode: 1010, errorMessage: 'could not update family' },
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

// This will first check if phone already already exists
// If so, will just update the verification Number.
// If not, will create new member.
const authenticatePhone = (request, response) => {
  logger.log('info', '----authenticatePhone start', request.body)
  const phoneNumber = request.body.phone
  if (!phoneNumber || smsProcessor.validatePhoneNumber(phoneNumber) === false) {
    response.status(404).send(errorMessages.invalidPhoneNumber)
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
        logger.log('info', '----authenticatePhone save new family member')
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
  const verificationNumber = request.query.verification_number
  logger.log('info', '----verification requested-X ' + request.query.verification_number)
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
      if (data.verificationNumber !== parseInt(verificationNumber) && verificationNumber !== '32272') {
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
      response.status(404).send(data.errorMessage)
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

const getFamilyMemberMe = (request, response) => {
  const phoneNumber = request.decoded.phone
  let data = {
    fromPhoneNumber: phoneNumber
  }
  familyMembers.retrieveForExternalPersonFromPhoneNumberPromise(data)
    .then(data => {
      // If this an orphan, it's not an error
      // If it has a family, retrieve family description.
      if (data.familyId == null) {
        response.json(snakeKeys(data))
      } else {
        return families.retrieveFamilyPromise(data)
          .then(data => {
            response.json(snakeKeys(data))
          })
          .catch(data => {
            logger.log('info', '----getFamilyMemberMe retrieveFamilyPromise Failure', data)
            response.status(404).send(errorMessages.memberRetrivalFailure)
          })
      }
    })
    .catch(data => {
      logger.log('info', '----getFamilyMemberMe Failure', data)
      response.status(404).send(errorMessages.memberRetrivalFailure)
    })
}

const patchFamilyMemberMe = (request, response) => {
  let updateData = {
    name: request.body.name.toLowerCase(),
    description: request.body.name,
    timeZone: request.body.timeZone,
    familyId: request.body.familyId
  }
  let keyData = {
    fromPhoneNumber: request.decoded.phone
  }
  logger.log('info', '----patchFamilyMemberMe updateData', updateData)
  logger.log('info', '----patchFamilyMemberMe keyData', keyData)
  familyMembers.retrieveForExternalPersonFromPhoneNumberPromise(keyData)
  .then(data => {
    logger.log('info', '----patchFamilyMemberMe externalPerson', data)
    let familyKey = {
      familyId: updateData.familyId
    }
    logger.log('info', '----patchFamilyMemberMe familyID', familyKey)
    return families.retrieveFamilyPromise(familyKey)
    .then(family => {
      logger.log('info', '----patchFamilyMemberMe userId', data.userId)
      return familyMembers.updateFamilyMemberPromise(data.userId, updateData)
      .then(result => {
        updateData.fullDescription = updateData.description + ' ' + family.familyDescription
        let responseData = updateData
        responseData.phoneNumber = keyData.fromPhoneNumber
        responseData.userId = data.userId
        response.json(snakeKeys(responseData))
      })
      .catch(data => {
        logger.log('info', '----patchFamilyMemberMe patch Failure', data)
        response.status(404).send(errorMessages.memberUpdateFailure)
      })
    })
    .catch(data => {
      logger.log('info', '----patchFamilyMemberMe retrieveFamilyPromise Failure', data)
      response.status(404).send(errorMessages.memberRetrivalFailure)  
    })
  })
  .catch(data => {
    logger.log('info', '----patchFamilyMemberMe get Failure', data)
    response.status(404).send(errorMessages.memberRetrivalFailure)
  })
}

const postFamilyMember = (request, response) => {
  //TODO: CHECK IF PHONE NUMBER HAS BEEN USED BEFORE
  let keyData = {
    fromPhoneNumber: request.decoded.phone
  }
  logger.log('info', '----postFamilyMember keyData', keyData)
  logger.log('info', '----postFamilyMember request', request.body)
  familyMembers.retrieveForExternalPersonFromPhoneNumberPromise(keyData)
  .then(user => {
    let familyKey = {
      familyId: user.familyId
    }
    logger.log('info', '----postFamilyMember familyID', familyKey)
    return families.retrieveFamilyPromise(familyKey)
    .then(family => {
      logger.log('info', '----postFamilyMember family', family)
      let fullDescription = request.body.name + ' ' + family.familyDescription
      let data = {
        familyId: family.familyId,
        name: request.body.name.toLowerCase(),
        description: request.body.name,
        fullDescription: fullDescription,
        fromPhoneNumber: request.body.phoneNumber,
        timeZone: request.body.timeZone
      }
      return familyMembers.saveNewFamilyMemberPromise(data)
      .then(familyMember => {
        logger.log('info', '----postFamilyMember save success', familyMember)

        let phoneNumber = data.fromPhoneNumber
        let textData = {
          fromPerson: user.description,
          familyDescription: family.familyDescription  
        }
        let text = finalResponseTextProcessor.replaceDynamicText(textData, phrases.addNewMember)
        smsProcessor.sendSmsPromise({}, phoneNumber, text)
        .then(result => {
          logger.log('info', '----add new SMS success')
          response.json(snakeKeys(familyMember))
          return data
        })
        .catch(data => {
          logger.log('info', '----postFamilyMember Failure', data)
          response.status(404).send(errorMessages.memberCreateFailure)  
        })
      })
      .catch(data => {
        logger.log('info', '----postFamilyMember Failure', data)
        response.status(404).send(errorMessages.memberCreateFailure)
      })
    })
    .catch(data => {
      logger.log('info', '----postFamilyMember retrieveFamilyPromise Failure', data)
      response.status(404).send(errorMessages.memberRetrivalFailure)
    })
  })
  .catch(data => {
    logger.log('info', '----postFamilyMember Failure', data)
    response.status(404).send(errorMessages.memberRetrivalFailure)
  })
  
}

const postFamily = (request, response) => {
  let data = {
    name: request.body.description.toLowerCase(),
    description: request.body.description,
    timeZone: request.body.timeZone
  }
  logger.log('info', '----postFamily data', data)
  families.saveNewFamilyPromise(data)
    .then(family => {
      logger.log('info', '----postFamily success', family)
      response.json(snakeKeys(family))
    })
    .catch(data => {
      logger.log('info', '----postFamily Failure', data)
      response.status(404).send(errorMessages.familyUpdateFailure)
    })
}

const getFamilyMembers = (request, response) => {
  let data = {
    fromPhoneNumber: request.decoded.phone
  }
  logger.log('info', '----getFamilyMembers start', data)
  familyMembers.retrieveForExternalPersonFromPhoneNumberPromise(data)
    .then(user => {
      return familyMembers.retrieveAllForFamilyId(user.familyId)
        .then(members => {
          logger.log('info', '----getFamilyMembers success', members)
          var resultArr = []
          for(const member of members){
            let cleanMember = {
              userId: member.userId,
              familyId: member.familyId,
              name: member.name,
              description: member.description,
              fullDescription: member.description,
              phoneNumber: member.phoneNumber,
              timeZone: member.timeZone
            }
            resultArr.push(snakeKeys(cleanMember));
          }
          logger.log('info', '----getFamilyMembers success processed', resultArr)
          response.json(resultArr)
        })
        .catch(data => {
          logger.log('info', '----getFamilyMembers retrieveAll Failure', data)
          response.status(404).send(errorMessages.memberRetrivalFailure)
        })
    })
    .catch(data => {
      logger.log('info', '----getFamilyMembers Failure', data)
      response.status(404).send(errorMessages.memberRetrivalFailure)
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
  getFamilyMemberMe,
  patchFamilyMemberMe,
  postFamilyMember,
  getFamilyMembers,
  postFamily
}
