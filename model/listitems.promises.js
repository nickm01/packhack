const mongoOp = require('./mongo')

const findPromise = (list, familyId) => {
  return mongoOp.ListItems.find({listKey: list, familyId})
    .exec()
}

const saveNewPromise = (listKey, familyId, listItemName) => {
  var newListItem = new mongoOp.ListItems({listKey, listItemName, familyId})
  return newListItem.save()
}

const deletePromise = (listKey, familyId, listItemName) => {
  return mongoOp.ListItems.remove({listKey, listItemName, familyId})
      .exec()
}

module.exports = {
  findPromise,
  saveNewPromise,
  deletePromise
}
