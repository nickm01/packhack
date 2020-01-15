const mongoOp = require('./mongo')
const modelConstants = require('./modelconstants')

const findFromNameFamilyPromise = (name, familyId) => {
  const filter = name === modelConstants.allFamilyMembersName ? {familyId} : {name, familyId}
  return mongoOp.FamilyMembers.find(filter)
    .exec()
}

const findFromPhoneNumberPromise = (phoneNumber) => {
  return mongoOp.FamilyMembers.find({phoneNumber: phoneNumber})
    .exec()
}

const saveNewFamilyMemberPromise = (familyMember) => {
  var newFamilyMember  = new mongoOp.FamilyMembers(familyMember)
  return newFamilyMember.save()
}

const updateFamilyMemberVerificationNumberPromise = (userId, verificationNumber) => {
  const filter = { userId: userId }
  const update = { verificationNumber: verificationNumber }
  logger.log('info', '___familymembers_updateFamilyMemberVerificationNumberPromise2', filter, update)
  return mongoOp.FamilyMembers.findOneAndUpdate(filter, update)
    .exec()
}

module.exports = {
  findFromNameFamilyPromise,
  findFromPhoneNumberPromise,
  saveNewFamilyMemberPromise,
  updateFamilyMemberVerificationNumberPromise
}
