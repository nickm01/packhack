const mongoOp = require('./mongo')

const findOnePromise = (list, familyId) => {
  return mongoOp.Lists.findOne({listKey: list, familyId})
    .exec()
}

const findAllPromise = (familyId) => {
  return mongoOp.Lists.find({familyId})
    .exec()
}

const saveNewPromise = (list, familyId, listDescription) => {
  var newList = new mongoOp.Lists({listKey: list, familyId, listDescription})
  return newList.save()
}

const deletePromise = (list, familyId) => {
  return mongoOp.Lists.remove({listKey: list, familyId})
      .exec()
}

module.exports = {
  findOnePromise,
  findAllPromise,
  saveNewPromise,
  deletePromise
}
