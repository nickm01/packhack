const mongoOp = require('./mongo')

const listsFindOnePromise = ({listKey, familyId}) => {
  console.log('--------- THIS SHOULD NOT BE CALLED')
  return mongoOp.Lists.findOne({listKey, familyId})
    .exec()
}

module.exports = {
  listsFindOnePromise
}
