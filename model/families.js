const familiesPromises = require('./families.promises')
const logger = require('winston')
const modelConstants = require('./modelconstants')

const retrieveFamilyPromise = (data) => {
  logger.log('info', '___families_retrieveFamilyPromise', data)
  return familiesPromises.findFamilyPromise(data.familyId)
    .then(families => {
      if (families.length === 0) {
        logger.log('info', 'no result')
        data.errorMessage = modelConstants.errorTypes.familyNotFound
        throw data
      }
      const foundFamily = families[0]
      data.familyDescription = foundFamily.description
      logger.log('info', '___families_retrieveFamilyPromise success', data)
      return data
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const saveNewFamilyPromise = (data) => {
  logger.log('info', '___familymembers_saveNewFamilyPromise', data)
  const id = uuidv4()
  const family = {
    id: id,
    name: data.name,
    description: data.description,
    timeZone: data.timeZone || 'America/New_York'
  }
  logger.log('info', '___familymembers_save_family', family)
  return familiesPromises.saveNewFamilyPromise(family)
    .then(result => {
      return family
    }, (error) => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

const uuidv4 = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

module.exports = {
  retrieveFamilyPromise,
  saveNewFamilyPromise
}
