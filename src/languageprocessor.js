const stringProcessor = require('./stringprocessor')

const commandTypes = {
  getlists: 'getlists',
  getList: 'getList',
  createList: 'createList',
  clearList: 'clearList',
  deleteList: 'deleteList',
  addListItem: 'addListItem',
  removeListItem: 'removeListItem',
  sendList: 'sendList'
}

// Note more complex constructs should be at the end
const commandData = [
  {command: commandTypes.getlists, actuals: ['lists', 'get lists', 'show lists', 'display lists']},
  {command: commandTypes.getList, actuals: ['get', 'show', 'display'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.createList, actuals: ['create'], postProcessing: 'postProcessCreate'},
  {command: commandTypes.clearList, actuals: ['clear', 'empty', 'flush'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.deleteList, actuals: ['delete'], postProcessing: 'setListFromSecondWord'},
  {command: commandTypes.sendList, actuals: ['send'], postProcessing: 'postProcessSend'},
  {command: commandTypes.addListItem, actuals: ['add', 'append'], commandCanBeFirstOrSecondWord: true, postProcessing: 'postProcessAdd'},
  {command: commandTypes.removeListItem, actuals: ['remove'], commandCanBeFirstOrSecondWord: true, postProcessing: 'postProcessRemove'}
  // remind
  // flock/help
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
  const result = new LanguageProcessorResult({text: text, cachedListName: cachedListName})
    .convertToWords()
    .checkZeroWords()
    .getCommandFromWords()
    .errorIfNoCommand()
    .postProcess()

  return {
    command: result.commandObj ? result.commandObj.command : null,
    list: result.list,
    person: result.person,
    supplementaryText: result.supplementaryText
  }
}

// USE OF PROTOTYPES FOR METHOD CHAINING
// https://schier.co/blog/2013/11/14/method-chaining-in-javascript.html
// https://medium.com/tiny-code-lessons/javascript-cascade-design-pattern-990b1a761ff4#.8xxot6rc0

const LanguageProcessorResult = function ({text, cachedListName}) {
  this.originalText = text
  this.words = null
  this.commandObj = null
  this.list = null
  this.previouslyCachedListName = cachedListName
  this.supplementaryText = null
  this.person = null
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
  this.commandObj = commandData.filter(obj => {
    return obj.actuals.filter(commandText => {
      return ((obj.commandCanBeFirstOrSecondWord &&
                this.words.length > 1 &&
                this.words[1].toLowerCase() === commandText
              ) || (
                this.words[0].toLowerCase() === commandText
              ) || (
                this.originalText.toLowerCase() === commandText
              )
      )
    }).length > 0
  })[0]
  return this
}

LanguageProcessorResult.prototype.errorIfNoCommand = function () {
  if (!this.commandObj) {
    if (this.words.length === 1) {
      throw new LanguageProcessorError(errorTypes.unrecognizedCommandCouldBeList, this)
    } else {
      throw new LanguageProcessorError(errorTypes.unrecognizedCommand, this)
    }
  }
  return this
}

LanguageProcessorResult.prototype.postProcess = function () {
  if (this.commandObj && this.commandObj.postProcessing) {
    return this[this.commandObj.postProcessing]()
  }
  return this
}

LanguageProcessorResult.prototype.setListFromSecondWord = function () {
  if (this.words.length < 2) {
    throw new LanguageProcessorError(errorTypes.noList, this)
  } else {
    return this.setListFromWord(this.words[1])
  }
}

LanguageProcessorResult.prototype.postProcessBasicListCommandIncludingCache = function () {
  if (this.words.length === 1 && this.previouslyCachedListName) {
    return this.setListFromWord(this.previouslyCachedListName)
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
  return this.postProcessItem('to')
}

LanguageProcessorResult.prototype.postProcessRemove = function () {
  return this.postProcessItem('from')
}

// Tries to restructure to a standard "list add item" format, then gets the supplementaryText
LanguageProcessorResult.prototype.postProcessItem = function (connector) {
  // Checks if second word is a command, but not first
  if (this.commandObj.actuals.indexOf(this.words[1].toLowerCase()) !== -1 &&
    this.commandObj.actuals.indexOf(this.words[0].toLowerCase()) === -1
  ) {
    this.words[1] = this.words[1].toLowerCase()
    this.setListFromFirstWord()
  } else if (this.words.length >= 4 && this.words[this.words.length - 2].toLowerCase() === connector) {
    this.setListFromWord(this.words[this.words.length - 1])
    this.words.unshift(this.list)
    this.words = this.words.splice(0, this.words.length - 2)
  } else {
    this.setListFromCache()
    this.words.unshift(this.list)
  }
  this.supplementaryText = this.words.splice(2).join(' ')
  return this
}

LanguageProcessorResult.prototype.postProcessSend = function () {
  console.log('>>>> postProcessSend')
  if (this.words.length < 2) {
//    throw new LanguageProcessorError(errorTypes.noList, this)
  }
  this.setPersonFromWord(this.words[1])
  if (this.words.length < 3) {
//    this.setListFromCache
  } else {
    this.setListFromWord(this.words[2])
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
  this.list = str.removePrefix('#').toLowerCase()
  return this
}

LanguageProcessorResult.prototype.setPersonFromWord = function (str) {
  this.preson = str.removePrefix('@').toLowerCase()
  return this
}

String.prototype.removePrefix = function (prefix) {
  if (this.charAt(0) === prefix) {
    return this.substr(1)
  } else {
    return this
  }
}

class LanguageProcessorError extends Error {
  constructor (message, languageProcessorResult) {
    super()
    this.message = message
    this.originalText = languageProcessorResult.originalText
    this.words = languageProcessorResult.words
    this.command = languageProcessorResult.commandObj ? languageProcessorResult.commandObj.command : null
    this.list = languageProcessorResult.list
  }
}

module.exports = {
  processText,
  errorTypes,
  commandTypes
}
