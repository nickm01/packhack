const mongoOp = require('./mongo')

const findFromNameFamilyPromise = (name, familyId) => {
  const filter = name ? {name, familyId} : {familyId}
  return mongoOp.FamilyMembers.find(filter)
    .exec()
}

// const findAllPromise = (familyId) => {
//   return mongoOp.Lists.find({familyId})
//     .exec()
// }

module.exports = {
  findFromNameFamilyPromise
}
