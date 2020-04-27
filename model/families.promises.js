const mongoOp = require('./mongo')

const findFamilyPromise = (familyId) => {
  const filter = {familyId}
  return mongoOp.FamilyMembers.find(filter)
    .exec()
}

module.exports = {
  findFamilyPromise
}
