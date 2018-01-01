const listsPromises = require('./lists.promises')
const modelConstants = require('./modelconstants')
const logger = require('winston')

const validateListExistsPromise = (data) => {
  logger.log('debug', '___lists_validateListExistsPromise', data)
  return listsPromises.findOnePromise(data.list, data.familyId)
    .then(list => {
      if (!list) {
        data.listExists = false
        data.errorMessage = modelConstants.errorTypes.listNotFound
        throw data
      } else {
        data.listExists = true
        return data
      }
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const findAllPromise = (data) => {
  logger.log('debug', '___lists_findAllPromise', data)
  return listsPromises.findAllPromise(data.familyId)
    .then(lists => {
      data.lists = lists
      return data
    })
}

const saveNewPromise = (data) => {
  logger.log('debug', '___lists_saveNewPromise', data)
  const list = data.list.toLowerCase()
  const listDescription = data.list
  return listsPromises.saveNewPromise(list, data.familyId, listDescription)
    .then(list => {
      data.list = list.listKey
      data.listDescription = list.listDescription
      return data
    }, (error) => {
      if (error.message ===  modelConstants.errorTypes.duplicateList) {
        data.errorMessage = error.message
      } else {
        data.errorMessage = modelConstants.errorTypes.generalError
      }
      data.systemError = error
      throw data
    })
}

const deletePromise = (data) => {
  logger.log('debug', '___lists_deletePromise', data)
  return listsPromises.deletePromise(data.list, data.familyId)
    .then(result => {
      if (result.result && result.result.n === 0) {
        data.errorMessage = modelConstants.errorTypes.listNotFound
        throw data
      } else {
        return data
      }
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  validateListExistsPromise,
  findAllPromise,
  saveNewPromise,
  deletePromise
}
