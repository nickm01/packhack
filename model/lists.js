const listsMongoPromises = require('./listsmongopromises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = (data) => {
  return listsMongoPromises.listsFindOnePromise(data.list, data.familyId)
    .then((results) => {
      if (results.length === 0) {
        throw new Error(modelConstants.errorTypes.notFound)
      } else {
        return true
      }
    }, () => {
      return modelConstants.errorTypes.generalError
    })
}

module.exports = {
  validateListExistsPromise
}
