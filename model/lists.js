const listsMongoPromises = require('./listsmongopromises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = ({listKey, familyId}) => {
  console.log('----VALIDATE CALLED')
  return listsMongoPromises.listsFindOnePromise({listKey, familyId})
    .then((results) => {
      console.log('----VALIDATE THEN')
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
