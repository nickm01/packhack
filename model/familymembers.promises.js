const mongoOp = require('./mongo')
const modelConstants = require('./modelconstants')

const findFromNameFamilyPromise = (name, familyId) => {
  const filter = name === modelConstants.allFamilyMembersName ? {name, familyId} : {familyId}
  return mongoOp.FamilyMembers.find(filter)
    .exec()
}

module.exports = {
  findFromNameFamilyPromise
}
