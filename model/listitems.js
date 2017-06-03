const listItemsPromises = require('./listitems.promises')
const modelConstants = require('./modelconstants')

const findPromise = (data) => {
  return listItemsPromises.findPromise(data.list, data.familyId)
    .then(listItems => {
      data.listItems = listItems
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  findPromise
}
