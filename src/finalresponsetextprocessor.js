const phrases = require('./phrases')
const logger = require('winston')

const replaceDynamicText = (data, str) => {
  logger.log('debug', '___finalresponsetextprocessor_replaceDynamicText', data)
  var finalText = str
  if (data.list) {
    // regex replace will replace every occurence
    finalText = finalText.replace(/%#list/g, '#' + data.list)
  }
  if (data.person) {
    finalText = finalText.replace('%@person', '@' + data.person)
  }
  if (data.fromPerson) {
    finalText = finalText.replace('%@fromPerson', '@' + data.fromPerson)
  }
  if (data.reminderUserDateText) {
    finalText = finalText.replace('%%date', data.reminderUserDateText)
  }
  finalText = finalText.replace('%%commandSpecificSuggestion', phrases[data.command + 'Example'])
  logger.log('debug', 'finalText', finalText)
  return finalText
}

module.exports = {
  replaceDynamicText
}
