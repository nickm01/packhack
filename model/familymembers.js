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
  logger.log('debug', '___familymembers_retrievePersonFromPhoneNumberPromise', data)
  return familyMembersPromises.findFromPhoneNumberPromise(data.fromPhoneNumber)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        logger.log('debug', 'phone number not found')
        data.errorMessage = modelConstants.errorTypes.personNotFound
        throw data
      }
      const foundPerson = familyMembers[0]
      data.fromPerson = foundPerson.name
      data.familyId = foundPerson.familyId
      data.timezone = foundPerson.timeZone || 'America/New_York'
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  retrievePersonPhoneNumbersPromise,
  retrievePersonFromPhoneNumberPromise
}
