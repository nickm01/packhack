// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const familyMembers = require('../model/familymembers')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const commandTypes = require('./commandtypes')
const phrases = require('./phrases')

const processTextPromise = (data) => {
  console.log('6')
  console.log(data)
  return languageProcessor.processLanguagePromise(data)
  .then(conditionallyValidatePersonExistsAndRetrievePhoneNumbers)
  .then(conditionallyValidateListExists)
  .then(conditionallyValidateListDoesNotExists)
  .then(commandSpecificProcessorPromise)
  .catch(processError)
  .catch(fallBackError)
  .then(replaceDynamicText)
}

const conditionallyValidatePersonExistsAndRetrievePhoneNumbers = (data) => {
  console.log('__conditionallyValidatePersonExistsAndRetrievePhoneNumbers')
  console.log(data)
  if (data.person) {
    // @all processing here
    return familyMembers.retrievePersonPhoneNumbersPromise(data)
  } else {
    return Q.resolve(data)
  }
}

const conditionallyValidateListExists = (data) => {
  if (data.list && data.command !== commandTypes.createList) {
    return lists.validateListExistsPromise(data)
  } else {
    return Q.resolve(data)
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
    return Q.resolve(data)
  }
}

const commandSpecificProcessorPromise = (data) => {
  console.log('6b')
  console.log(data)
  // TODO: Remove 'if' once all commands are done
  if (data.command && (
    data.command === commandTypes.getList ||
    data.command === commandTypes.getLists ||
    data.command === commandTypes.createList ||
    data.command === commandTypes.deleteList ||
    data.command === commandTypes.addListItem ||
    data.command === commandTypes.removeListItem ||
    data.command === commandTypes.clearList ||
    data.command === commandTypes.sendList
  )) {
    console.log('6c')
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')
    return processor.processResponseTextPromise(data)
  } else {
    console.log('6d')
    return Q.resolve(data)
  }
}

const processError = (data) => {
  console.log('10-error')
  console.log(data)
  // TODO: Remove 'if' once all commands are done
  if (data.command && (
    data.command === commandTypes.getList ||
    data.command === commandTypes.getLists ||
    data.command === commandTypes.createList ||
    data.command === commandTypes.deleteList ||
    data.command === commandTypes.addListItem ||
    data.command === commandTypes.removeListItem ||
    data.command === commandTypes.clearList ||
    data.command === commandTypes.sendList
  )) {
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
    if (data.errorMessage === errors.errorTypes.noList) {
      console.log(444)
      data.responseText += '\n' + phrases[data.command + 'Example']
      console.log(data)
    } else if (data.errorMessage === errors.errorTypes.listNotFound) {
      console.log(555)
      data.responseText += '\n' + phrases.suggestGetLists
      console.log(data)
    }
  } else {
    // TODO: ???General error
    console.log('processError-fallthrough')
  }
}

const fallBackError = (data) => {
  data.responseText = phrases.generalMisundertanding
  return Q.resolve(data)
}

const replaceDynamicText = (data) => {
  console.log('44444dynamictext')
  console.log(data)
  if (data.list) {
    data.responseText = data.responseText.replace('%#list', '#' + data.list)
  }
  return data
}

module.exports = {
  processTextPromise
}
