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

const saveNewReminderPromise = (data) => {
  const list = {
    listKey: data.list,
    listItemName: data.listItemName,
    familyId: data.familyId,
    reminderWhen: data.reminderWhenGMT,
    reminderUserId: data.person,
    reminderTitle: data.reminderTitle
  }
  if (data.reminderList) {
    list.reminderListKey = data.reminderList
  }
  return listItemsPromises.saveNewReminderPromise(list)
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
  saveNewReminderPromise,
  deletePromise
}
