// Responsible for processing the language of the text into structured commmands and objects

const stringProcessor = require('./stringprocessor')
const Q = require('q')
const errors = require('./errors')
const commandTypes = require('./commandtypes')
const logger = require('winston')

// Note more complex constructs should be at the end
const commandData = [
  {command: commandTypes.getLists, actuals: ['lists', 'get lists', 'show lists', 'display lists']},
  {command: commandTypes.getList, actuals: ['get', 'show', 'display'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.editList, actuals: ['edit', 'change'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.createList, actuals: ['create'], postProcessing: 'postProcessCreate'},
  {command: commandTypes.clearList, actuals: ['clear', 'empty', 'flush'], postProcessing: 'postProcessBasicListCommandIncludingCache'},
  {command: commandTypes.deleteList, actuals: ['delete'], postProcessing: 'postProcessDelete'},
  {command: commandTypes.addListItem, actuals: ['add', 'append'], commandCanBeFirstOrSecondWord: true, postProcessing: 'postProcessAdd'},
  {command: commandTypes.removeListItem, actuals: ['remove'], commandCanBeFirstOrSecondWord: true, postProcessing: 'postProcessRemove'},
  {command: commandTypes.sendList, actuals: ['send'], postProcessing: 'postProcessSend'},
  {command: commandTypes.addReminder, actuals: ['remind'], postProcessing: 'postProcessAddReminder'},
  {command: commandTypes.help, actuals: ['help', 'packhack', 'assist', '?', 'intro', 'hack']},
  {command: commandTypes.pushIntro, actuals: ['**welcome'], postProcessing: 'postProcessPushIntro'}
]

// MAIN PROCESS
const processLanguage = (data) => {
  try {
    logger.log('debug', '___languageprocessor_processlanguage1', data)
    const result = new LanguageProcessorResult({text: data.originalText.trim(), cachedListName: data.cachedListName})
      .convertToWords()
      .checkZeroWords()
      .getCommandFromWords()
      .guessGetIfNoCommandSingleWord()
      .errorIfNoCommand()
      .postProcess()
    setDataAccordingToResult(data, result)
    logger.log('debug', '___languageprocessor_processlanguage2', data)
    return data
  } catch (error) {
    data.errorMessage = error.error
    setDataAccordingToResult(data, error.languageProcessorResult)
    throw data
  }
}

const setDataAccordingToResult = (data, result) => {
  logger.log('debug', '___languageprocessor_setDataAccordingToResult', result)
  data.command = result.commandObj ? result.commandObj.command : null
  data.list = result.list
  data.person = result.person
  data.supplementaryText = result.supplementaryText
  data.words = result.words
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
  if (this.words.length === 0) { throw new LanguageProcessorError(errors.errorTypes.noText, this) }
  return this
}

LanguageProcessorResult.prototype.getCommandFromWords = function () {
  this.commandObj = commandData.filter(obj => {
    return obj.actuals.filter(commandText => {
      return ((obj.commandCanBeFirstOrSecondWord &&
                this.words.length > 1 &&
                this.words[1].toLowerCase() === commandText &&
                !this.words[0].isACommand() // this is for add/remove text confusion
              ) || (
                this.words[0].toLowerCase() === commandText
              ) || (
                this.originalText.toLowerCase() === commandText
              )
      )
    }).length > 0
  })[0]
  logger.log('debug', '___languageprocessor_getCommandFromWords', this)
  return this
}

LanguageProcessorResult.prototype.guessGetIfNoCommandSingleWord = function () {
  if (!this.commandObj) {
    if (this.words.length === 1) {
      this.commandObj = commandData[1] // Default to get
      this.setListFromFirstWord()
    }
  }
  return this
}

LanguageProcessorResult.prototype.errorIfNoCommand = function () {
  if (!this.commandObj) {
    throw new LanguageProcessorError(errors.errorTypes.unrecognizedCommand, this)
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
    throw new LanguageProcessorError(errors.errorTypes.noList, this)
  } else {
    return this.setListFromWord(this.words[1])
  }
}

LanguageProcessorResult.prototype.postProcessBasicListCommandIncludingCache = function () {
  if (this.list) {
    return this
  } else if (this.words.length === 1 && this.previouslyCachedListName) {
    return this.setListFromWord(this.previouslyCachedListName)
  } else {
    return this.setListFromSecondWord().validateMultipleWordListName()
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
    throw new LanguageProcessorError(errors.errorTypes.listNameInvalid, this)
  }
  return this.validateMultipleWordListName()
}

LanguageProcessorResult.prototype.validateMultipleWordListName = function () {
  if (this.words.length > 2) {
    throw new LanguageProcessorError(errors.errorTypes.listNameInvalid, this)
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
  // if nothing but add, just move on with no supplementaryText
  if (this.words.length === 1) {
    this.supplementaryText = ''
    return this
  }
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

LanguageProcessorResult.prototype.postProcessDelete = function () {
  return this.setListFromSecondWord().validateMultipleWordListName()
}

LanguageProcessorResult.prototype.postProcessSend = function () {
  this.checkNoPerson()
  const len = this.words.length
  // if this is of the structure "send list to someone"
  if (len >= 3 && this.words[len - 2] === 'to') {
    this.setPersonFromWord(this.words[len - 1])
    this.setListFromWord(this.words[1])
    if (len > 4) {
      this.supplementaryText = this.words.splice(2, len - 4).join(' ')
    }

  // else format is more like "send someone list"
  } else {
    this.setPersonFromWord(this.words[1])

    if (len < 3) {
      this.setListFromCache()
    } else {
      this.setListFromWord(this.words[2])
      if (len > 3) {
        this.supplementaryText = this.words.splice(3).join(' ')
      }
    }
  }
  return this
}

LanguageProcessorResult.prototype.postProcessPushIntro = function () {
  this.checkNoPerson()
  this.setPersonFromWord(this.words[1])
  this.supplementaryText = this.words[2]
  return this
}

LanguageProcessorResult.prototype.postProcessAddReminder = function () {
  this.checkNoPerson()

  // Retrieve person
  this.setPersonFromWord(this.words[1])

  // Retrieve list
  const lists = this.words.slice(2).filter(word => {
    return word.charAt(0) === '#'
  })
  if (lists.length > 0) {
    this.setListFromWord(lists[0])
  }

  // SupplementaryText
  this.supplementaryText = this.words.slice(2).filter(word => {
    return word.charAt(0) !== '#'
  }).join(' ')

  return this
}

LanguageProcessorResult.prototype.setListFromCache = function () {
  if (this.previouslyCachedListName) {
    this.setListFromWord(this.previouslyCachedListName)
  } else {
    throw new LanguageProcessorError(errors.errorTypes.noList, this)
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
  this.person = str.removePrefix('@').toLowerCase()
  return this
}

LanguageProcessorResult.prototype.checkNoPerson = function () {
  const len = this.words.length
  if (len === 1 ||
      (len === 2 && this.words[1].charAt(0) === '#')) {
    throw new LanguageProcessorError(errors.errorTypes.noPerson, this)
  }
  return this
}

String.prototype.removePrefix = function (prefix) {
  if (this.charAt(0) === prefix) {
    return this.substr(1)
  } else {
    return this
  }
}

// TODO: Refactor to flatmap
String.prototype.isACommand = function () {
  return (commandData.filter(obj => {
    return obj.actuals.filter(commandText => {
      return (this.toString().toLowerCase() === commandText)
    }).length > 0
  }).length > 0)
}

class LanguageProcessorError extends Error {
  constructor (message, languageProcessorResult) {
    super()
    this.error = message
    this.languageProcessorResult = languageProcessorResult
  }
}

// TODO: Is there a better approach - should this even be here?
const processLanguagePromise = (data) => {
  const deferred = Q.defer()
  try {
    const result = processLanguage(data)
    deferred.resolve(result)
  } catch (exception) {
    deferred.reject(exception)
  }
  return deferred.promise
}

module.exports = {
  processLanguage,
  processLanguagePromise
}
