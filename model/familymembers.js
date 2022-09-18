const familyMembersPromises = require('./familymembers.promises')
const modelConstants = require('./modelconstants')
const logger = require('winston')

const retrievePersonPhoneNumbersPromise = (data) => {
  logger.log('debug', '___familymembers_retrievePersonPhoneNumbersPromise', data)
  return familyMembersPromises.findFromNameFamilyPromise(data.person, data.familyId)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        logger.log('debug', 'no result')
        data.errorMessage = modelConstants.errorTypes.personNotFound
        throw data
      }
      data.phoneNumbers = familyMembers.map(familyMember => {
        return familyMember.phoneNumber
      })
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const retrievePersonFromPhoneNumberPromise = (data) => {
  logger.log('info', '___familymembers_retrievePersonFromPhoneNumberPromise', data)
  return familyMembersPromises.findFromPhoneNumberPromise(data.fromPhoneNumber)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        logger.log('debug', 'phone number not found')
        data.errorMessage = modelConstants.errorTypes.personNotFound
        throw data
      }
      const foundPerson = familyMembers[0]
      data.userId = foundPerson.userId
      data.fromPerson = foundPerson.name
      data.familyId = foundPerson.familyId
      data.timezone = foundPerson.timeZone || 'America/New_York'
      data.verificationNumber = foundPerson.verificationNumber
      data.verificationNumberExpiry = foundPerson.verificationNumberExpiry
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const retrieveForExternalPersonFromPhoneNumberPromise = (data) => {
  logger.log('info', '___familymembers_retrievePersonFromPhoneNumberPromise', data)
  return familyMembersPromises.findFromPhoneNumberPromise(data.fromPhoneNumber)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        logger.log('debug', 'phone number not found')
        data.errorMessage = modelConstants.errorTypes.personNotFound
        throw data
      }
      const foundPerson = familyMembers[0]
      return {
        userId: foundPerson.userId,
        name: foundPerson.name,
        familyId: foundPerson.familyId,
        timezone: foundPerson.timeZone || 'America/New_York',
        phoneNumber: foundPerson.phoneNumber,
        description: foundPerson.description
      }
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const retrieveAllForFamilyId = (familyId) => {
  logger.log('info', '___familymembers_familyId', familyId)
  return familyMembersPromises.findAll(familyId)
    .then(familyMembers => {
      return familyMembers
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const updateFamilyMemberVerificationNumberPromise = (data) => {
  logger.log('info', '___familymembers_updateFamilyMemberVerificationNumberPromise', data)
  return familyMembersPromises.updateFamilyMemberVerificationNumberPromise(data.userId, data.verificationNumber, data.verificationNumberExpiry)
    .then(result => {
      return data
    })
}

const saveNewFamilyMemberPromise = (data) => {
  logger.log('info', '___familymembers_saveNewFamilyMemberPromise', data)
  const familyMember = {
    userId: uuidv4(),
    familyId: data.familyId,
    name: data.name,
    description: data.description,
    fullDescription:  data.fullDescription,
    phoneNumber: data.fromPhoneNumber,
    timeZone: data.timeZone || 'America/New_York',
    verificationNumber: data.verificationNumber,
    verificationNumberExpiry: data.verificationNumberExpiry
  }
  logger.log('info', '___familymembers_save_familyMember', familyMember)
  return familyMembersPromises.saveNewFamilyMemberPromise(familyMember)
    .then(data => {
      return familyMember
    }, (error) => { 
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const updateFamilyMemberPromise = (userId, data) => {
  logger.log('info', '___familymembers_updateFamilyMemberPromise', data)
  return familyMembersPromises.updateFamilyMemberPromise(userId, data)
    .then(result => {
      return result
    })
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

module.exports = {
  retrievePersonPhoneNumbersPromise,
  retrievePersonFromPhoneNumberPromise,
  retrieveForExternalPersonFromPhoneNumberPromise,
  updateFamilyMemberVerificationNumberPromise,
  saveNewFamilyMemberPromise,
  updateFamilyMemberPromise
}
