const familyMembersPromises = require('./familymembers.promises')
const modelConstants = require('./modelconstants')

const retrievePersonPhoneNumbersPromise = (data) => {
  console.log('___retrievePersonPhoneNumbersPromise')
  console.log(data)
  return familyMembersPromises.findFromNameFamilyPromise(data.person, data.familyId)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        console.log('no result')
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
  console.log('___retrievePersonFromPhoneNumberPromise')
  return familyMembersPromises.findFromPhoneNumberPromise(data.fromPhoneNumber)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        console.log('phone number not found')
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
