const mongoOp = require('./mongo')

const findOnePromise = ({listKey, familyId}) => {
  console.log('11')
  console.log(listKey)
  console.log(familyId)
  console.log('11b')
  return mongoOp.Lists.findOne({listKey, familyId})
    .exec()
}

module.exports = {
  findOnePromise
}
