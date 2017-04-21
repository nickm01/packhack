// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')

const processTextPromise = (data) => {
  return languageProcessor.processLanguagePromise(data)
  .then(lists.validateListExistsPromise)
}

module.exports = {
  processTextPromise
}
