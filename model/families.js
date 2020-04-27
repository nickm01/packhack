const familyMembersPromises = require('./familymembers.promises')
const logger = require('winston')
const modelConstants = require('./modelconstants')

const retrieveFamilyPromise = (data) => {
  logger.log('debug', '___families_retrieveFamilyPromise', data)
  return familyMembersPromises.findFamilyPromise(data.familyId)
    .then(families => {
      if (families.length === 0) {
        logger.log('debug', 'no result')
        data.errorMessage = modelConstants.errorTypes.familyNotFound
        throw data
      }
      const foundFamily = families[0]
      data.familyName = foundFamily.name
      data.familyDescription = foundFamily.description
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  retrieveFamilyPromise
}
