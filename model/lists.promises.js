const mongoOp = require('./mongo')

const findOnePromise = (listKey, familyId) => {
  return mongoOp.Lists.findOne({listKey, familyId})
    .exec()
}

const findAllPromise = (familyId) => {
  return mongoOp.Lists.find({familyId})
    .exec()
}

const saveNewPromise = (listKey, familyId, listDescription) => {
  var newList = new mongoOp.Lists({listKey, familyId, listDescription})
  return newList.save()
}

const deletePromise = (listKey, familyId) => {
  const filter = listKey ? {listKey, familyId} : {familyId}
  return mongoOp.Lists.remove(filter)
      .exec()
}

module.exports = {
  findOnePromise,
  findAllPromise,
  saveNewPromise,
  deletePromise
}
