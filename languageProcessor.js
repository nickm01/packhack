const stringProcessor = require('./stringprocessor')

const getListFromSecondWordOrCache = (words, cachedListName) => {
  if (words.length === 1 && cachedListName) {
    return cachedListName
  } else {
    return getListFromSecondWord(words)
  }
}

const postProcessBasicListCommandIncludingCache = returnObj => {
  if (returnObj.words.length === 1 && returnObj.previouslyCachedListName) {
    returnObj.list = returnObj.previouslyCachedListName
  } else {
    returnObj.list = getListFromSecondWord(returnObj.words)
  }
  console.log('1:' + returnObj.list)
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

// Changes it into the format of add *
const getListForAdd = (words, cachedListName) => {
  if (words.length >= 4 && words[words.length-2] === 'to') {
    const list = extractListFromWord(words[words.length-1])
    words.unshift(list)
    words = words.splice(0, words.length-2)
    return list
  } else {
    return getListFromCache(words, cachedListName)
  }
}

const getListFromCache = (words, cachedListName) => {
  if (cachedListName) {
    return cachedListName
  } else {
    throw new Error(errorTypes.noList)
  }
}

const getListFromFirstWordOnly = (words, cachedListName) => {
  return extractListFromWord(words[0])
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

const commandTypes = {
  getlists: 'getlists',
  getList: 'getList',
  createList: 'createList',
  clearList: 'clearList',
  addListItem: 'addListItem'
}

const commandData = [
  { command: commandTypes.getlists, actuals: ['lists', 'get lists', 'show lists', 'display lists'], getList: doNothing},
  { command: commandTypes.getList, actuals: ['get','show','display'], getList: doNothing, postProcessing: 'postProcessBasicListCommandIncludingCache'},
  { command: commandTypes.createList, actuals: ['create'], getList: getListFromSecondWord, postProcessing:'validateNewListName'},
  { command: commandTypes.clearList, actuals: ['clear', 'empty', 'flush'], getList: getListFromSecondWordOrCache},
  { command: commandTypes.addListItem, actuals: ['add'], getList: getListForAdd},
  { command: commandTypes.addListItem, actuals: ['* add'], getList: getListFromFirstWordOnly}
]

const errorTypes = {
  noText : 'noText',
  unrecognizedCommand: 'unrecognizedCommand',
  unrecognizedCommandCouldBeList: 'unrecognizedCommandCouldBeList',
  noList : 'noList',
  listNameInvalid : 'listNameInvalid'
}

const getCommandFromWords = words => {
  return commandData.filter(obj => {
    return obj.actuals.filter(actualText => {
      const actualTextWords = stringProcessor.stringToWords(actualText)

      // Processing to match 1 or 2 words
      if (actualTextWords.length === 1) {
        return (words[0].toLowerCase() === actualText)
      } else if (actualTextWords.length === 2) {
        return (words.length > 1 &&
          (words[0].toLowerCase() === actualTextWords[0] || actualTextWords[0] === '*')
          && words[1].toLowerCase() === actualTextWords[1])
      }
    }).length > 0
  })[0]
}

// MAIN PROCESS
const processText = (text, cachedListName) => {
  const returnObj = new languageProcessorResult({text: text, cachedListName: cachedListName})
    .convertToWords()
    .checkZeroWords()
    .getCommandFromWords()
    .errorIfNoCommand()
    .postProcess()

  console.log('xxxxxxxxxxxxxx:' + x.command)

  // const words = stringProcessor.stringToWords(text)
  //
  // if (words.length === 0) {throw new Error(errorTypes.noText)}
  //
  // const commandObj = getCommandFromWords(words)
  // if (!commandObj) {
  //   if (words.length ===1) {
  //     throw new Error(errorTypes.unrecognizedCommandCouldBeList)
  //   } else {
  //     throw new Error(errorTypes.unrecognizedCommand)
  //   }
  // }
  //
  // const returnObj = {
  //   command: commandObj.command,
  //   list: commandObj.getList(words, cachedListName),
  //   previouslyCachedListName: cachedListName,
  //   words: words
  // }
  //
  // // Miscellaneous processing
  // commandObj.postProcessing(returnObj)
  // console.log('2:' + returnObj.list)

  return returnObj
}

// METHOD CHAIN IDEA... NEEDS TO BE IMPLEMENTED
// https://schier.co/blog/2013/11/14/method-chaining-in-javascript.html
// https://medium.com/tiny-code-lessons/javascript-cascade-design-pattern-990b1a761ff4#.8xxot6rc0
// OR use promises

// const getCommandFromWords = object => {
//   object.command = commandData.filter(obj => {
//     return obj.actuals.filter(actualText => {
//       const actualTextWords = stringProcessor.stringToWords(actualText)
//
//       // Processing to match 1 or 2 words
//       if (actualTextWords.length === 1) {
//         return (words[0].toLowerCase() === actualText)
//       } else if (actualTextWords.length === 2) {
//         return (words.length > 1 &&
//           (words[0].toLowerCase() === actualTextWords[0] || actualTextWords[0] === '*')
//           && words[1].toLowerCase() === actualTextWords[1])
//       }
//     }).length > 0
//   })[0]
//   return object
// }

const x = object => {
  if (!object.commandObj) {
    if (words.length ===1) {
      throw new Error(errorTypes.unrecognizedCommandCouldBeList)
    } else {
      throw new Error(errorTypes.unrecognizedCommand)
    }
  }
  return object
}

const extractListFromWord = (str) => {
  if (str.charAt(0) === '#') {
    return str.toString().substr(1).toLowerCase()
  } else {
    return str.toString().toLowerCase()
  }
}

const languageProcessorResult = function ({text: text, cachedListName: cachedListName}) {
  this.originalText = text
  this.words = null
  this.command = null
  this.list = null
  this.previouslyCachedListName = cachedListName
  this.postProcessing = null
}

languageProcessorResult.prototype.convertToWords = function() {
  this.words = stringProcessor.stringToWords(this.originalText)
  return this
}

languageProcessorResult.prototype.checkZeroWords = function() {
  if (this.words.length === 0) {throw new Error(errorTypes.noText)}
  return this
}

languageProcessorResult.prototype.getCommandFromWords = function() {
  const commandobj = commandData.filter(obj => {
    return obj.actuals.filter(actualText => {
      const actualTextWords = stringProcessor.stringToWords(actualText)

      // Processing to match 1 or 2 words
      if (actualTextWords.length === 1) {
        return (this.words[0].toLowerCase() === actualText)
      } else if (actualTextWords.length === 2) {
        return (this.words.length > 1 &&
          (this.words[0].toLowerCase() === actualTextWords[0] || actualTextWords[0] === '*')
          && this.words[1].toLowerCase() === actualTextWords[1])
      }
    }).length > 0
  })[0]
  if (commandobj) {
    // Destructuring
    this.command = commandobj.command
    this.postProcessing = commandobj.postProcessing
    this.list = commandobj.getList(this.words, this.cachedListName) //TODO: Change to single post-process
  }
  return this
}

languageProcessorResult.prototype.errorIfNoCommand = function() {
  if (!this.command) {
    if (this.words.length ===1) {
      throw new Error(errorTypes.unrecognizedCommandCouldBeList)
    } else {
      throw new Error(errorTypes.unrecognizedCommand)
    }
  }
  return this
}

languageProcessorResult.prototype.postProcess = function() {
  console.log('postProcess')
  if (!!this.postProcessing) {
    console.log('postProcess2')
    return this[this.postProcessing]()
  }
  return this
}


languageProcessorResult.prototype.postProcessBasicListCommandIncludingCache = function() {
  if (this.words.length === 1 && this.previouslyCachedListName) {
    this.list = this.previouslyCachedListName
  } else {
    this.list = getListFromSecondWord(this.words)
  }
  console.log('X1:' + this.list)
  return this
}

languageProcessorResult.prototype.validateNewListName = function() {
  const listToBeValidated = this.list
  console.log('------ validateNewListName: ' + this.list + ' - ' + this.originalText)

  // Reserved Words
  if (commandData.filter(obj => {
      return obj.actuals.filter(actualText => {
        return (listToBeValidated === actualText)
      }).length > 0
    }).length > 0) {
      throw new Error(errorTypes.listNameInvalid)
    }

  // Multiple Words
  if (this.words.length > 2) {
    throw new Error(errorTypes.listNameInvalid)
  }

  return this
}


module.exports = {
  processText,
  errorTypes: errorTypes,
  commandTypes: commandTypes
}
