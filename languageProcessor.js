const stringProcessor = require('./stringprocessor')

const commandTypes = {
  getlists: 'getlists',
  getList: 'getList',
  createList: 'createList',
  clearList: 'clearList',
  addListItem: 'addListItem'
}

const commandData = [
  { command: commandTypes.getlists, actuals: ['lists', 'get lists', 'show lists', 'display lists']},
  { command: commandTypes.getList, actuals: ['get','show','display'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  { command: commandTypes.createList, actuals: ['create'], postProcessing:'postProcessCreate'},
  { command: commandTypes.clearList, actuals: ['clear', 'empty', 'flush'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  { command: commandTypes.addListItem, actuals: ['add'], postProcessing: 'postProcessAdd'},
  { command: commandTypes.addListItem, actuals: ['* add'], postProcessing: 'setListFromFirstWord'}
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

  return returnObj
}

// METHOD CHAINING
// https://schier.co/blog/2013/11/14/method-chaining-in-javascript.html
// https://medium.com/tiny-code-lessons/javascript-cascade-design-pattern-990b1a761ff4#.8xxot6rc0

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

languageProcessorResult.prototype.setListFromSecondWord = function() {
  if (this.words.length < 2) {
    throw new Error(errorTypes.noList)
  } else {
    if (this.words[1].charAt(0) === '#') {
      this.list = this.words[1].substr(1).toLowerCase()
    } else {
      this.list = this.words[1].toLowerCase()
    }
  }
  return this
}

languageProcessorResult.prototype.postProcessBasicListCommandIncludingCache = function() {
  if (this.words.length === 1 && this.previouslyCachedListName) {
    this.setListFromWord(this.previouslyCachedListName)
    return this
  } else {
    return this.setListFromSecondWord()
  }
}

languageProcessorResult.prototype.postProcessCreate = function() {
  return this.setListFromSecondWord().validateNewListName()
}

languageProcessorResult.prototype.validateNewListName = function() {
  console.log('------ validateNewListName: ' + this.list + ' - ' + this.originalText)

  // Reserved Words
  if (commandData.filter(obj => {
      return obj.actuals.filter(actualText => {
        return (this.list === actualText)
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

languageProcessorResult.prototype.postProcessAdd = function() {
  if (this.words.length >= 4 && this.words[this.words.length-2] === 'to') {
    this.setListFromWord(this.words[this.words.length-1])
    this.words.unshift(this.list)
    this.words = this.words.splice(0, this.words.length-2)
  } else {
    return this.setListFromCache()
  }
  return this
}

languageProcessorResult.prototype.setListFromCache = function() {
  if (this.previouslyCachedListName) {
    this.setListFromWord(this.previouslyCachedListName)
  } else {
    throw new Error(errorTypes.noList)
  }
  return this
}

languageProcessorResult.prototype.setListFromFirstWord = function() {
  return this.setListFromWord(this.words[0])
}

languageProcessorResult.prototype.setListFromWord = function(str) {
  if (str.charAt(0) === '#') {
    this.list = str.toString().substr(1).toLowerCase()
  } else {
    this.list = str.toString().toLowerCase()
  }
  return this
}

module.exports = {
  processText,
  errorTypes: errorTypes,
  commandTypes: commandTypes
}
