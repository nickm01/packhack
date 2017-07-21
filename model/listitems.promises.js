const mongoOp = require('./mongo')

const findPromise = (list, familyId) => {
  return mongoOp.ListItems.find({listKey: list, familyId})
    .exec()
}

const saveNewPromise = (listKey, familyId, listItemName) => {
  var newListItem = new mongoOp.ListItems({listKey, listItemName, familyId})
  return newListItem.save()
}

const saveNewReminderPromise = (list) => {
  var newListItem = new mongoOp.ListItems(list)
  return newListItem.save()
}

const deletePromise = (listKey, familyId, listItemName) => {
  const filter = listItemName ? {listKey, listItemName, familyId} : {listKey, familyId}
  return mongoOp.ListItems.remove(filter)
      .exec()
}

module.exports = {
  findPromise,
  saveNewPromise,
  saveNewReminderPromise,
  deletePromise
}
