const mongoOp = require('./mongo')

const findOnePromise = (list, familyId) => {
  console.log('11')
  console.log(list)
  console.log(familyId)
  console.log('11b')
  return mongoOp.Lists.findOne({listKey: list, familyId})
    .exec()
}

module.exports = {
  findOnePromise
}
