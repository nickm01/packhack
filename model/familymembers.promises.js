const mongoOp = require('./mongo')

const findFromNamePromise = (name, familyId) => {
  return mongoOp.FamilyMembers.find({name, familyId})
    .exec()
}

// const findAllPromise = (familyId) => {
//   return mongoOp.Lists.find({familyId})
//     .exec()
// }

module.exports = {
  findFromNamePromise
}
