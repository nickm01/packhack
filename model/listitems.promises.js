const mongoOp = require('./mongo')

const findPromise = (list, familyId) => {
  return mongoOp.ListItems.find({listKey: list, familyId})
    .exec()
}

const saveNewPromise = (list, familyId, listItemName) => {
  var newListItem = new mongoOp.ListItems({listKey: list, listItemName, familyId})
  return newListItem.save()
}

module.exports = {
  findPromise,
  saveNewPromise
}
