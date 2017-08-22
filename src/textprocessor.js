// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const familyMembers = require('../model/familymembers')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const commandTypes = require('./commandtypes')
const phrases = require('./phrases')
const finalResponseTextProcessor = require('./finalresponsetextprocessor')
const logger = require('winston')

const processTextPromise = data => {
  console.log('>>>>       WINSTON        <<<<')
  logger.log('silly', 'silly >>>> ******************** <<<<')
  logger.log('debug', 'debug >>>> ******************** <<<<')
  logger.log('info', 'info >>>> ******************** <<<<')
  logger.log('warn', 'warn >>>> ******************** <<<<')
  logger.log('error', 'error >>>> ******************** <<<<')
  console.log('___commandSpecificProcessorPromise')
  console.log(data)
  return checkValidPhoneNumber(data)
  .then(languageProcessor.processLanguagePromise)
  .then(conditionallyValidatePersonExistsAndRetrievePhoneNumbers)
  .then(conditionallyValidateListExists)
  .then(conditionallyValidateListDoesNotExists)
  .then(commandSpecificProcessorPromise)
  .catch(processError)
  .catch(fallBackError)
  .then(data => {
    data.responseText = finalResponseTextProcessor.replaceDynamicText(data, data.responseText)
    return data
  })
}

const checkValidPhoneNumber = (data) => {
  return familyMembers.retrievePersonFromPhoneNumberPromise(data)
    .catch(result => {
      console.log('___checkValidPhoneNumber_catch')
      console.log(result)
      if (result.errorMessage === errors.errorTypes.personNotFound) {
        console.log('___checkValidPhoneNumber_personNotFound')
        result.errorMessage = errors.errorTypes.notRegistered
      }
      throw result
    })
}

const conditionallyValidatePersonExistsAndRetrievePhoneNumbers = (data) => {
  console.log('__conditionallyValidatePersonExistsAndRetrievePhoneNumbers')
  console.log(data)
  if (data.person === modelConstants.meFamilyMamberName) {
    console.log('me')
    data.person = data.fromPerson
    data.phoneNumbers = [data.fromPhoneNumber]
    return data
  } else if (data.person) {
    console.log('not me')
    if (data.command === commandTypes.pushIntro) {
      data.familyId = Number(data.supplementaryText)
    }
    return familyMembers.retrievePersonPhoneNumbersPromise(data)
  } else {
    console.log('else')
    return data
  }
}

const conditionallyValidateListExists = (data) => {
  console.log('___conditionallyValidateListExists')
  console.log(data)
  console.log(data.list)
  if (data.list && data.command !== commandTypes.createList) {
    return lists.validateListExistsPromise(data)
  } else {
    return data
  }
}

const conditionallyValidateListDoesNotExists = (data) => {
  if (data.command === commandTypes.createList) {
    return lists.validateListExistsPromise(data).then(result => {
      // Found an existing list, then it's an error
      result.errorMessage = errors.errorTypes.listAlreadyExists
      throw result
    }, result => {
      // Errored and didn't find list, then it's not an error
      if (result.errorMessage === modelConstants.errorTypes.listNotFound) {
        result.errorMessage = null
        return result
      } else {
        result.errorMessage = errors.errorTypes.generalError
        throw result
      }
    })
  } else {
    return data
  }
}

const commandSpecificProcessorPromise = (data) => {
  console.log('___commandSpecificProcessorPromise')
  console.log(data)
  if (data.command) {
    console.log('6c')
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')
    return processor.processResponseTextPromise(data)
  } else {
    console.log('6d')
    return data
  }
}

const processError = (data) => {
  console.log('___processError')
  console.log(data)
  if (data.command) {
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')

    // if there is specific processing, use it.
    if (processor.processError) {
      processor.processError(data)
    }
    // if there is no responseText, fall back to standard pattern matching.
    if (!data.responseText) {
      standardMatchedErrorMessage(data)
    }
    return data
  } else {
    standardMatchedErrorMessage(data)
    throw data
  }
}

const standardMatchedErrorMessage = (data) => {
  const matchedPhrase = errors.errorTypes[data.errorMessage]
  console.log(222)
  console.log(matchedPhrase)
  if (matchedPhrase) {
    data.responseText = phrases[matchedPhrase]
    // Add suggestions according to type of error
    console.log(333)
    console.log(data.responseText)
    if (data.errorMessage === errors.errorTypes.listNotFound) {
      console.log(555)
      data.responseText += '\n' + phrases.suggestGetLists
      console.log(data)
    }
  } else {
    console.log('processError-fallthrough')
  }
}

const fallBackError = (data) => {
  if (!data.responseText) {
    data.responseText = phrases.generalMisundertanding
  }
  return data
}

module.exports = {
  processTextPromise
}
