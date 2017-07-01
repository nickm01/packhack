const listsPromises = require('./lists.promises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = (data) => {
  console.log(19)
  console.log(data)
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

const saveNewPromise = (data) => {
  const list = data.list.toLowerCase()
  const listDescription = data.list
  return listsPromises.saveNewPromise(list, data.familyId, listDescription)
    .then(list => {
      data.list = list.listKey
      data.listDescription = list.listDescription
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const deletePromise = (data) => {
  console.log('d19')
  console.log(data)
  return listsPromises.deletePromise(data.list, data.familyId)
    .then(result => {
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  validateListExistsPromise,
  saveNewPromise,
  deletePromise
}
