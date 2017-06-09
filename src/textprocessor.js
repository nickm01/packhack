// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const commandTypes = require('./commandtypes')

const processTextPromise = (data) => {
  console.log('1')
  console.log(data)
  return languageProcessor.processLanguagePromise(data)
  .then(conditionallyValidateListExists)
  .then(conditionallyValidateListDoesNotExists)
  .then(commandSpecificProcessorPromise)
  .catch(processError)
  .catch(fallBackError)
}

const conditionallyValidateListExists = (data) => {
  console.log('2')
  console.log(data)
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
      // Errored and sadidn't find list, then it's not an error
      if (result.errorMessage === modelConstants.errorTypes.notFound) {
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
  console.log('3')
  console.log(data)
  if (data.command && data.command === commandTypes.getList) {
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')
    return processor.processResponseTextPromise(data)
  } else {
    return Q.resolve(data)
  }
}

const processError = (data) => {
  if (data.command && data.command === commandTypes.getList) {
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')
    return processor.processErrorPromise(data)
  } else {
    throw data
  }
}

const fallBackError = (data) => {
  data.responseText = 'Sorry don\'t understand. Type \'packhack\' for help.'
  return Q.resolve(data)
}

module.exports = {
  processTextPromise
}
