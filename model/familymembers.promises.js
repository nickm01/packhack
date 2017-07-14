const mongoOp = require('./mongo')

const findFromNameFamilyPromise = (name, familyId) => {
  const filter = name ? {name, familyId} : {familyId}
  return mongoOp.FamilyMembers.find(filter)
    .exec()
}

module.exports = {
  findFromNameFamilyPromise
}
