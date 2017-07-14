const familyMembersPromises = require('./familymembers.promises')
const modelConstants = require('./modelconstants')

const retrievePersonPhoneNumbersPromise = (data) => {
  console.log(7777)
  console.log(data)
  // TODO: Need to check for @all
  return familyMembersPromises.findFromNameFamilyPromise(data.person, data.familyId)
    .then(familyMembers => {
      if (familyMembers.length === 0) {
        console.log('7777c')
        console.log(data)
        data.errorMessage = modelConstants.errorTypes.personNotFound
        throw data
      }
      data.phoneNumbers = familyMembers.map(familyMember => {
        return familyMember.phoneNumber
      })
      console.log('7777b')
      console.log(data)
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  retrievePersonPhoneNumbersPromise
}
