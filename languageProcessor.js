const stringProcessor = require('./stringprocessor')

const getListFromSecondWordOrCache = (words, cachedListName) => {
  if (words.length === 1 && cachedListName) {
    return cachedListName
  } else {
    return getListFromSecondWord(words)
  }
}

const getListFromSecondWord = (words) => {
  if (words.length < 2) {
    throw new Error(errorTypes.noList)
  } else {
    if (words[1].charAt(0) === '#') {
      return words[1].substr(1).toLowerCase()
    } else {
      return words[1].toLowerCase()
    }
  }
}

const doNothing = () => {}

const validateNewListName = (resultObject) => {
  const listToBeValidated = resultObject.list

  // Reserved Words
  if (commandData.filter(obj => {
      return obj.actuals.filter(actualText => {
        return (listToBeValidated === actualText)
      }).length > 0
    }).length > 0) {
      throw new Error(errorTypes.listNameInvalid)
    }

  // Multiple Words
  if (resultObject.words.length > 2) {
    throw new Error(errorTypes.listNameInvalid)
  }

}

const commandData = [
  { command: 'getlists', actuals: ['lists', 'get lists', 'show lists', 'display lists'], getList: doNothing, validateList: false, additionalProcessing: doNothing},
  { command: 'getList', actuals: ['get','show','display'], getList: getListFromSecondWordOrCache, validateList: true, additionalProcessing: doNothing},
  { command: 'createList', actuals: ['create'], getList: getListFromSecondWord, validateList: false, additionalProcessing:validateNewListName}
]

const getCommandFromWords = (words) => {
  return commandData.filter(obj => {
    return obj.actuals.filter(actualText => {
      const actualTextWords = stringProcessor.stringToWords(actualText)

      // Processing to match 1 or 2 words
      if (actualTextWords.length === 1) {
        return (words[0].toLowerCase() === actualText)
      } else if (actualTextWords.length === 2) {
        return (words.length > 1 && words[0].toLowerCase() === actualTextWords[0] &&
          words[1].toLowerCase() === actualTextWords[1])
      }
    }).length > 0
  })[0]
}

const errorTypes = {
  noText : 'noText',
  unrecognizedCommand: 'unrecognizedCommand',
  unrecognizedCommandCouldBeList: 'unrecognizedCommandCouldBeList',
  noList : 'noList',
  listNameInvalid : 'listNameInvalid'
}

// MAIN PROCESS
const processText = (text, cachedListName) => {
  const words = stringProcessor.stringToWords(text)

  if (words.length === 0) {throw new Error(errorTypes.noText)}

  const commandObj = getCommandFromWords(words)
  if (!commandObj) {
    if (words.length ===1) {
      throw new Error(errorTypes.unrecognizedCommandCouldBeList)
    } else {
      throw new Error(errorTypes.unrecognizedCommand)
    }
  }

  const returnObj = {
    command: commandObj.command,
    list: commandObj.getList(words, cachedListName),
    validateList: commandObj.validateList,
    words: words
  }

  // Miscellaneous processing
  commandObj.additionalProcessing(returnObj)

  return commandObj
}

module.exports = {
  processText,
  errorTypes: errorTypes
}
