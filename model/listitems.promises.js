const mongoOp = require('./mongo')

const findPromise = ({listKey, familyId}) => {
  return mongoOp.ListItems.find({listKey, familyId})
    .exec()
}

module.exports = {
  findPromise
}
