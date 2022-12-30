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
const stringProcessor = require('./stringprocessor')

const processTextPromise = data => {
  logger.log('debug', '___textprocessor_processTextPromise', data)
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
    .then(data => {
      logger.log('info', 'checkValidPhoneNumber_found', data)
      if (data.fullAccess === true) {
        logger.log('info', 'checkValidPhoneNumber_found_fullAccess', data)
        return data
      } else {
        logger.log('info', 'checkValidPhoneNumber_found_noAccess', data)
        data.errorMessage = errors.errorTypes.noAccess
        data.responseText = phrases.noAccess
        throw data
      }
      return data
    })
    .catch(result => {
      logger.log('debug', 'checkValidPhoneNumber_catch', result)
      if (result.errorMessage === errors.errorTypes.personNotFound) {
        logger.log('debug', 'checkValidPhoneNumber_personNotFound')
        result.errorMessage = errors.errorTypes.notRegistered
      }
      throw result
    })
}

const conditionallyValidatePersonExistsAndRetrievePhoneNumbers = (data) => {
  logger.log('debug', '__textprocessor.conditionallyValidatePersonExistsAndRetrievePhoneNumbers', data)
  if (data.person === modelConstants.meFamilyMamberName) {
    logger.log('debug', 'me')
    data.person = data.fromPerson
    data.phoneNumbers = [data.fromPhoneNumber]
    return data
  } else if (data.person) {
    logger.log('debug', 'not me')
    if (data.command === commandTypes.pushIntro ||
        data.command === commandTypes.adminSend) {
      data.familyId = Number(stringProcessor.stringToWords(data.supplementaryText)[0])
    }
    return familyMembers.retrievePersonPhoneNumbersPromise(data)
  } else {
    logger.log('debug', 'else')
    return data
  }
}

const conditionallyValidateListExists = (data) => {
  logger.log('debug', '___textprocessor_conditionallyValidateListExists', data)
  if (data.list && data.command !== commandTypes.createList) {
    return lists.validateListExistsPromise(data)
  } else {
    return data
  }
}

const conditionallyValidateListDoesNotExists = (data) => {
  logger.log('debug', '___textprocessor_conditionallyValidateListDoesNotExists', data)
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
  logger.log('debug', '___textprocessor_commandSpecificProcessorPromise', data)
  if (data.command) {
    logger.log('debug', 'data.command')
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')
    logger.log('debug', '_processor: ' + processor)
    return processor.processResponseTextPromise(data)
  } else {
    logger.log('debug', '!data.command')
    return data
  }
}

const processError = (data) => {
  logger.log('debug', '___textprocessor_processError', data)
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
  logger.log('debug', '___textprocessor_standardMatchedErrorMessage')
  const matchedPhrase = errors.errorTypes[data.errorMessage]
  logger.log('debug', 'matched1', matchedPhrase)
  if (matchedPhrase) {
    data.responseText = phrases[matchedPhrase]
    // Add suggestions according to type of error
    logger.log('debug', 'matched2', data.responseText)
    if (data.errorMessage === errors.errorTypes.listNotFound) {
      data.responseText += '\n' + phrases.suggestGetLists
      logger.log('debug', 'matched3', data.responseText)
    }
  } else {
    logger.log('debug', 'error fallthrough')
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
