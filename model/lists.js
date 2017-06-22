const listsPromises = require('./lists.promises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = (data) => {
  return listsPromises.findOnePromise(data.list, data.familyId)
    .then(lists => {
      console.log('15-1')
      console.log(lists)
      if (!lists.length || lists.length === 0) {
        data.listExists = false
        data.errorMessage = modelConstants.errorTypes.notFound
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
  console.log('8')
  console.log(data)
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

module.exports = {
  validateListExistsPromise,
  saveNewPromise
}
