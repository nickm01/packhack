const mongoOp = require('./mongo')

const findOnePromise = (list, familyId) => {
  return mongoOp.Lists.findOne({listKey: list, familyId})
    .exec()
}

module.exports = {
  findOnePromise
}
