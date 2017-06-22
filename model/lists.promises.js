const mongoOp = require('./mongo')

const findOnePromise = (list, familyId) => {
  return mongoOp.Lists.findOne({listKey: list, familyId})
    .exec()
}

const saveNewPromise = (list, familyId, listDescription) => {
  var newList = new mongoOp.Lists({listKey: list, familyId, listDescription})
  return newList.save()
}

module.exports = {
  findOnePromise,
  saveNewPromise
}
