const mongoOp = require('./mongo')

const listsFindOnePromise = ({listKey, familyId}) => {
  return mongoOp.Lists.findOne({listKey, familyId})
    .exec()
}

module.exports = {
  listsFindOnePromise
}
