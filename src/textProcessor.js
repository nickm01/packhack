// Responsible for taking the text of a text message and processing it fully.

const languageProcessor = require('./languageprocessor')

const processText = (text, cachedListName) => {
  const result = languageProcessor.processLanguage(text, cachedListName)
  console.log('>>> ' + result)
  // should validate listname
}

module.exports = {
  processText
}
