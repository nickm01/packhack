const mongoOp = require('./mongo')

const findOnePromise = (list, familyId) => {
  return mongoOp.Lists.findOne({listKey: list, familyId})
    .exec()
}

const saveNewPromise = (list, familyId, listDescription) => {
  var newList = new mongoOp.Lists({listKey: list, familyId, listDescription})
  const x = newList.save()
  console.log('9')
  console.log(x)
  return x
}

module.exports = {
  findOnePromise,
  saveNewPromise
}
