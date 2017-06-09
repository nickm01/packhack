const listsPromises = require('./lists.promises')
const modelConstants = require('./modelconstants')

const validateListExistsPromise = (data) => {
  console.log('7')
  console.log(data)
  return listsPromises.findOnePromise(data.list, data.familyId)
    .then(lists => {
      console.log('10')
      console.log(lists)
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
