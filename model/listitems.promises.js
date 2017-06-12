const mongoOp = require('./mongo')

const findPromise = (list, familyId) => {
  return mongoOp.ListItems.find({listKey: list, familyId})
    .exec()
}

module.exports = {
  findPromise
}
