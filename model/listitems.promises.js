const mongoOp = require('./mongo')

const findPromise = (list, familyId) => {
  return mongoOp.ListItems.find({listKey: list, familyId})
    .exec()
}

const saveNewPromise = (list, familyId, listItemName) => {
  var newListItem = new mongoOp.ListItems({listKey: list, listItemName, familyId})
  return newListItem.save()
}

const deletePromise = (list, familyId, listItemName) => {
  return mongoOp.ListItems.remove({listKey: list, listItemName, familyId})
      .exec()
}

module.exports = {
  findPromise,
  saveNewPromise,
  deletePromise
}
