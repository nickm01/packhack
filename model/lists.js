const listsMongoPromises = require('./listsmongopromises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = (data) => {
  return listsMongoPromises.listsFindOnePromise(data.list, data.familyId)
    .then(lists => {
      if (lists.length === 0) {
        data.error = modelConstants.errorTypes.notFound
        throw data
      } else {
        data.listExists = true
        return data
      }
    }, () => {
      data.error = modelConstants.errorTypes.generalError
      throw data
    })
}

module.exports = {
  validateListExistsPromise
}
