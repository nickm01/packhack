const mongoOp = require('./mongo')

const findOnePromise = ({listKey, familyId}) => {
  return mongoOp.Lists.findOne({listKey, familyId})
    .exec()
}

module.exports = {
  findOnePromise
}
