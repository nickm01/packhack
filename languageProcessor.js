const stringProcessor = require('./stringprocessor')

const getListFromSecondWordOrCache = (words, cachedListName) => {
  if (words.length < 2 && !cachedListName) {
    throw new Error(errorTypes.noList)
  } else if (words.length === 1) {
    return cachedListName
  } else {
    if (words[1].charAt(0) === '#') {
      return words[1].substr(1)
    } else {
      return words[1]
    }
  }
}

const commandData = [
  { command: 'get', actuals: ['get','show'], getList: getListFromSecondWordOrCache, validateList: true}
]

const errorTypes = {
  noText : 'noText',
  unrecognizedCommand: 'unrecognizedCommand',
  unrecognizedCommandCouldBeList: 'unrecognizedCommandCouldBeList',
  noList : 'noList'
}

const processText = (text, cachedListName) => {
  const words = stringProcessor.stringToWords(text)

  if (words.length === 0) {
    throw new Error(errorTypes.noText)
  }

  const commandObj = commandData.filter(obj => {
    // TODO: Node 6 switch to contains
    return (obj.actuals.indexOf(words[0]) >= 0)
  })[0]

  if (!commandObj) {
    if (words.length ===1) {
      throw new Error(errorTypes.unrecognizedCommandCouldBeList)
    } else {
      throw new Error(errorTypes.unrecognizedCommand)
    }
  }
  return {
    command: commandObj.command,
    list: commandObj.getList(words, cachedListName),
    validateList: commandObj.validateList
  }
}


module.exports = {
  processText,
  errorTypes: errorTypes
}
