const listsMongoPromises = require('./listsmongopromises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = (data) => {
  return listsMongoPromises.listsFindOnePromise(data.list, data.familyId)
    .then(lists => {
      if (lists.length === 0) {
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

module.exports = {
  validateListExistsPromise
}
