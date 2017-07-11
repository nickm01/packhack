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

const saveNewPromise = (data) => {
  return listItemsPromises.saveNewPromise(data.list, data.familyId, data.listItemName)
    .then(list => {
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const deletePromise = (data, listItemName) => {
  return listItemsPromises.deletePromise(data.list, data.familyId, listItemName)
    .then(result => {
      console.log('deletePromise1')
      console.log(result)
      if (result.result && result.result.n === 0) {
        data.errorMessage = modelConstants.errorTypes.listItemNotFound
        throw data
      } else {
        return data
      }
    }, error => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  findPromise,
  saveNewPromise,
  deletePromise
}
