// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const commandTypes = require('./commandtypes')
const phrases = require('./phrases')

const processTextPromise = (data) => {
  console.log('6')
  console.log(data)
  return languageProcessor.processLanguagePromise(data)
  .then(conditionallyValidateListExists)
  .then(conditionallyValidateListDoesNotExists)
  .then(commandSpecificProcessorPromise)
  .catch(processError)
  .catch(fallBackError)
}

const conditionallyValidateListExists = (data) => {
  if (data.list && data.command !== commandTypes.createList) {
    return lists.validateListExistsPromise(data)
  } else {
    return Q.resolve(data)
  }
}

const conditionallyValidateListDoesNotExists = (data) => {
  console.log('6a')
  console.log(data)
  if (data.command === commandTypes.createList) {
    console.log('6a1')
    console.log(data)
    return lists.validateListExistsPromise(data).then(result => {
      // Found an existing list, then it's an error
      result.errorMessage = errors.errorTypes.listAlreadyExists
      console.log('6a2')
      console.log(result)
      throw result
    }, result => {
      // Errored and sadidn't find list, then it's not an error
      if (result.errorMessage === modelConstants.errorTypes.notFound) {
        result.errorMessage = null
        console.log('6a3')
        console.log(result)
        return result
      } else {
        console.log('6a4')
        console.log(result)
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
    data.command === commandTypes.createList
  )) {
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')
    return processor.processResponseTextPromise(data)
  } else {
    return Q.resolve(data)
  }
}

const processError = (data) => {
  console.log('10-error')
  console.log(data)
  // TODO: Remove 'if' once all commands are done
  if (data.command && (
    data.command === commandTypes.getList ||
    data.command === commandTypes.createList
  )) {
    const processor = require('./commandtextprocessors/' + data.command.toLowerCase() + '.textprocessor.js')

    // if there is specific processing, use it.
    // if there is no responseText, fall back to standard pattern matching.
    if (processor.processError) {
      processor.processError(data)
    }
    if (!data.responseText) {
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
        }
      } else {
        // TODO: ???General error
      }
    }
    return data
  } else {
    throw data
  }
}

const fallBackError = (data) => {
  data.responseText = phrases.generalMisundertanding
  return Q.resolve(data)
}

module.exports = {
  processTextPromise
}
