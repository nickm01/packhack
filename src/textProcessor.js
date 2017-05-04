// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const Q = require('q')
const modelConstants = require('../model/modelconstants')

const processTextPromise = (data) => {
  return languageProcessor.processLanguagePromise(data)
  .then(conditionallyValidateListExists)
  .then(conditionallyValidateListDoesNotExists)
}

const conditionallyValidateListExists = (data) => {
  if (data.list && data.command !== languageProcessor.commandTypes.createList) {
    return lists.validateListExistsPromise(data)
  } else {
    return Q.resolve(data)
  }
}

const conditionallyValidateListDoesNotExists = (data) => {
  if (data.command === languageProcessor.commandTypes.createList) {
    return lists.validateListExistsPromise(data).then(result => {
      // Found an existing list, then it's an error
      result.errorMessage = languageProcessor.errorTypes.listAlreadyExists
      throw result
    }, result => {
      // Errored and sadidn't find list, then it's not an error
      if (result.errorMessage === modelConstants.errorTypes.notFound) {
        result.errorMessage = null
        return result
      } else {
        result.errorMessage = languageProcessor.errorTypes.generalError
        throw result
      }
    })
  } else {
    return Q.resolve(data)
  }
}

module.exports = {
  processTextPromise
}
