const stringProcessor = require('./stringprocessor')

const commandTypes = {
  getlists: 'getlists',
  getList: 'getList',
  createList: 'createList',
  clearList: 'clearList',
  addListItem: 'addListItem'
}

const commandData = [
  {command: commandTypes.getlists, actuals: ['lists', 'get lists', 'show lists', 'display lists']},
  {command: commandTypes.getList, actuals: ['get', 'show', 'display'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.createList, actuals: ['create'], postProcessing: 'postProcessCreate'},
  {command: commandTypes.clearList, actuals: ['clear', 'empty', 'flush'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.addListItem, actuals: ['add'], postProcessing: 'postProcessAdd'},
  {command: commandTypes.addListItem, actuals: ['* add'], postProcessing: 'setListFromFirstWord'}
]

const errorTypes = {
  noText: 'noText',
  unrecognizedCommand: 'unrecognizedCommand',
  unrecognizedCommandCouldBeList: 'unrecognizedCommandCouldBeList',
  noList: 'noList',
  listNameInvalid: 'listNameInvalid'
}

// MAIN PROCESS
const processText = (text, cachedListName) => {
  const returnObj = new LanguageProcessorResult({text: text, cachedListName: cachedListName})
    .convertToWords()
    .checkZeroWords()
    .getCommandFromWords()
    .errorIfNoCommand()
    .postProcess()

  return returnObj
}

// USE OF PROTOTYPES FOR METHOD CHAINING
// https://schier.co/blog/2013/11/14/method-chaining-in-javascript.html
// https://medium.com/tiny-code-lessons/javascript-cascade-design-pattern-990b1a761ff4#.8xxot6rc0

const LanguageProcessorResult = function ({text, cachedListName}) {
  this.originalText = text
  this.words = null
  this.command = null
  this.list = null
  this.previouslyCachedListName = cachedListName
  this.postProcessing = null
}

LanguageProcessorResult.prototype.convertToWords = function () {
  this.words = stringProcessor.stringToWords(this.originalText)
  return this
}

LanguageProcessorResult.prototype.checkZeroWords = function () {
  if (this.words.length === 0) { throw new LanguageProcessorError(errorTypes.noText, this) }
  return this
}

LanguageProcessorResult.prototype.getCommandFromWords = function () {
  const commandobj = commandData.filter(obj => {
    return obj.actuals.filter(actualText => {
      const actualTextWords = stringProcessor.stringToWords(actualText)

      // Processing to match 1 or 2 words
      if (actualTextWords.length === 1) {
        return (this.words[0].toLowerCase() === actualText)
      } else if (actualTextWords.length === 2) {
        return (this.words.length > 1 &&
          (this.words[0].toLowerCase() === actualTextWords[0] || actualTextWords[0] === '*') &&
            this.words[1].toLowerCase() === actualTextWords[1])
      }
    }).length > 0
  })[0]
  if (commandobj) {
    this.command = commandobj.command
    this.postProcessing = commandobj.postProcessing
  }
  return this
}

LanguageProcessorResult.prototype.errorIfNoCommand = function () {
  if (!this.command) {
    if (this.words.length === 1) {
      throw new LanguageProcessorError(errorTypes.unrecognizedCommandCouldBeList, this)
    } else {
      throw new LanguageProcessorError(errorTypes.unrecognizedCommand, this)
    }
  }
  return this
}

LanguageProcessorResult.prototype.postProcess = function () {
  if (this.postProcessing) {
    return this[this.postProcessing]()
  }
  return this
}

LanguageProcessorResult.prototype.setListFromSecondWord = function () {
  if (this.words.length < 2) {
    throw new LanguageProcessorError(errorTypes.noList, this)
  } else {
    if (this.words[1].charAt(0) === '#') {
      this.list = this.words[1].substr(1).toLowerCase()
    } else {
      this.list = this.words[1].toLowerCase()
    }
  }
  return this
}

LanguageProcessorResult.prototype.postProcessBasicListCommandIncludingCache = function () {
  if (this.words.length === 1 && this.previouslyCachedListName) {
    this.setListFromWord(this.previouslyCachedListName)
    return this
  } else {
    return this.setListFromSecondWord()
  }
}

LanguageProcessorResult.prototype.postProcessCreate = function () {
  return this.setListFromSecondWord().validateNewListName()
}

LanguageProcessorResult.prototype.validateNewListName = function () {
  // Reserved Words
  if (commandData.filter(obj => {
    return obj.actuals.filter(actualText => {
      return (this.list === actualText)
    }).length > 0
  }).length > 0) {
    throw new LanguageProcessorError(errorTypes.listNameInvalid, this)
  }

  // Multiple Words
  if (this.words.length > 2) {
    throw new LanguageProcessorError(errorTypes.listNameInvalid, this)
  }

  return this
}

LanguageProcessorResult.prototype.postProcessAdd = function () {
  if (this.words.length >= 4 && this.words[this.words.length - 2] === 'to') {
    this.setListFromWord(this.words[this.words.length - 1])
    this.words.unshift(this.list)
    this.words = this.words.splice(0, this.words.length - 2)
  } else {
    return this.setListFromCache()
  }
  return this
}

LanguageProcessorResult.prototype.setListFromCache = function () {
  if (this.previouslyCachedListName) {
    this.setListFromWord(this.previouslyCachedListName)
  } else {
    throw new LanguageProcessorError(errorTypes.noList, this)
  }
  return this
}

LanguageProcessorResult.prototype.setListFromFirstWord = function () {
  return this.setListFromWord(this.words[0])
}

LanguageProcessorResult.prototype.setListFromWord = function (str) {
  if (str.charAt(0) === '#') {
    this.list = str.toString().substr(1).toLowerCase()
  } else {
    this.list = str.toString().toLowerCase()
  }
  return this
}

class LanguageProcessorError extends Error {
  constructor (message, languageProcessorResult) {
    super()
    this.message = message
    this.originalText = languageProcessorResult.originalText
    this.words = languageProcessorResult.words
    this.command = languageProcessorResult.command
    this.list = languageProcessorResult.list
  }
}

module.exports = {
  processText,
  errorTypes,
  commandTypes
}
