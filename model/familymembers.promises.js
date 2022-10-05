const mongoOp = require('./mongo')
const modelConstants = require('./modelconstants')
const logger = require('winston')

const findFromNameFamilyPromise = (name, familyId) => {
  const filter = name === modelConstants.allFamilyMembersName ? {familyId} : {name, familyId}
  return mongoOp.FamilyMembers.find(filter)
    .exec()
}

const findAllPromise = (familyId) => {
  return mongoOp.FamilyMembers.find({familyId}).lean()
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
  logger.log('info', '___familymembers_updateFamilyMemberVerificationNumberPromise filter:', filter)
  logger.log('info', '___familymembers_updateFamilyMemberVerificationNumberPromise update:', update)
  return mongoOp.FamilyMembers.findOneAndUpdate(filter, update)
    .exec()
}

// only updates specific data
const updateFamilyMemberPromise = (userId, data) => {
  const filter = { userId: userId }
  const updateData = { }
  if (data.name) {
    updateData.name = data.name
  }
  if (data.description) {
    updateData.description = data.description
  }
  if (data.familyId) {
    updateData.familyId = data.familyId
  }
  if (data.timeZone) {
    updateData.timeZone = data.timeZone
  }
  if (data.fullDescription) {
    updateData.fullDescription = data.fullDescription
  }
  logger.log('info', '___familymembers_updateFamilyMemberPromise filter:', filter)
  logger.log('info', '___familymembers_updateFamilyMemberPromise update', updateData)
  return mongoOp.FamilyMembers.findOneAndUpdate(filter, updateData)
    .exec()
}

module.exports = {
  findFromNameFamilyPromise,
  findAllPromise,
  findFromPhoneNumberPromise,
  saveNewFamilyMemberPromise,
  updateFamilyMemberVerificationNumberPromise,
  updateFamilyMemberPromise
}
