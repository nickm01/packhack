const mongoOp = require('./mongo')
const modelConstants = require('./modelconstants')
const logger = require('winston')

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
  var newFamilyMember = new mongoOp.FamilyMembers(familyMember)
  return newFamilyMember.save()
}

const updateFamilyMemberVerificationNumberPromise = (userId, verificationNumber, verificationNumberExpiry) => {
  const filter = { userId: userId }
  const update = {
    verificationNumber: verificationNumber,
    verificationNumberExpiry: verificationNumberExpiry
  }
  logger.log('info', '___familymembers_updateFamilyMemberVerificationNumberPromise2', filter)
  logger.log('info', '___familymembers_updateFamilyMemberVerificationNumberPromise2', update)
  return mongoOp.FamilyMembers.findOneAndUpdate(filter, update)
    .exec()
}

module.exports = {
  findFromNameFamilyPromise,
  findFromPhoneNumberPromise,
  saveNewFamilyMemberPromise,
  updateFamilyMemberVerificationNumberPromise
}
