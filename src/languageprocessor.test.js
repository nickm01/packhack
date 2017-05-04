/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const languageProcessor = require('./languageProcessor')
const Q = require('q')
const errors = require('./errors')

// This is a help these unit tests be more succinct
const textShouldResult = (text, expectedResult, cachedListName) => {
  const actualResult = languageProcessor.processLanguage({originalText: text, cachedListName})
  shouldEqualExpectedActual(expectedResult, actualResult, text)
}

const textShouldError = (text, expectedResult, cachedListName) => {
  try {
    languageProcessor.processLanguage({originalText: text, cachedListName})
    should.fail('should fail')
  } catch (exception) {
    shouldEqualExpectedActual(expectedResult, exception, text)
  }
}

// TODO: Make this more generic with access to dictionary directly - and loop
const shouldEqualExpectedActual = function (expected, actual, originalText) {
  if (expected.command) {
    actual.command.should.equal(expected.command)
  }
  if (expected.words) {
    actual.words.should.equal(expected.words)
  }
  if (expected.list) {
    actual.list.should.equal(expected.list)
  }
  if (expected.person) {
    actual.person.should.equal(expected.person)
  }
  if (expected.errorMessage) {
    actual.errorMessage.should.equal(expected.errorMessage)
  }
  actual.originalText.should.equal(originalText)
}

describe('languageProcessor', function () {
  const getCommand = languageProcessor.commandTypes.getList
  describe('basics', function () {
    it('❌ nothing', function () { textShouldError('', {command: null, list: null, message: errors.errorTypes.noText}) })
    it('✅ one word but not a command', function () { textShouldResult('yippeeee', {command: getCommand, list: 'yippeeee'}) })
    it('✅ getshopping', function () { textShouldResult('getshopping', {command: getCommand, list: 'getshopping'}) })
    it('❌ two word nonsense', function () { textShouldError('yipppeeee whippeee', {command: null, list: null, message: errors.errorTypes.unrecognizedCommand}) })
  })

  describe('getLists', function () {
    const command = languageProcessor.commandTypes.getlists
    it('✅ lists', function () { textShouldResult('lists', {command: command}) })
    it('✅ get lists', function () { textShouldResult('get lists', {command: command}) })
    it('✅ Get Lists', function () { textShouldResult('Get Lists', {command: command}) })
    it('✅ show lists', function () { textShouldResult('show lists', {command: command}) })
    it('✅ display lists', function () { textShouldResult('display lists', {command: command}) })
    it('✅ one word but not a command', function () { textShouldResult('getlists', {command: languageProcessor.commandTypes.getList, list: 'getlists'}) })
  })

  describe('createList', function () {
    const command = languageProcessor.commandTypes.createList
    it('✅ create #list', function () { textShouldResult('create #list', {command: command, list: 'list'}) })
    it('✅ create list', function () { textShouldResult('create list', {command: command, list: 'list'}) })
    it('✅ CREATE Something', function () { textShouldResult('CREATE SomeThing', {command: command, list: 'something'}) })
    it('✅ create with special characters', function () { textShouldResult('create 👍❤️😜!@#$%^&*()', {command: command, list: '👍❤️😜!@#$%^&*()'}) })
    it('❌ create #get', function () { textShouldError('create #get', {command: command, list: null, message: errors.errorTypes.listNameInvalid}) })
    it('❌ create Get', function () { textShouldError('create Get', {command: command, list: null, message: errors.errorTypes.listNameInvalid}) })
    it('❌ create #create', function () { textShouldError('create #create', {command: command, list: null, message: errors.errorTypes.listNameInvalid}) })
    it('❌ create', function () { textShouldError('create', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('❌ create only with cachedListName', function () { textShouldError('create', {command: command, list: null, message: errors.errorTypes.noList}) }, 'cachedListName')
    it('❌ create #list with multiple words', function () { textShouldError('create #list with multiple words', {command: command, list: null, message: errors.errorTypes.listNameInvalid}) })
    it('❌ create list with multiple words', function () { textShouldError('create list with multiple words', {command: command, list: null, message: errors.errorTypes.listNameInvalid}) })
  })

  describe('getList', function () {
    const command = languageProcessor.commandTypes.getList
    it('✅ get #list', function () { textShouldResult('get #list', {command: command, list: 'list'}) })
    it('✅ get list', function () { textShouldResult('get list', {command: command, list: 'list'}) })
    it('✅ show #list', function () { textShouldResult('show #list', {command: command, list: 'list'}) })
    it('✅ display lisT', function () { textShouldResult('display lisT', {command: command, list: 'list'}) })
    it('✅ get + cached listname', function () { textShouldResult('get', {command: command, list: 'cachedlistname'}, 'cachedListName') })
    it('✅ get #stuff + cached listname', function () { textShouldResult('get #stuff', {command: command, list: 'stuff'}, 'cachedListName') })
    it('❌ get', function () { textShouldError('get', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('❌ get one two', function () { textShouldError('get one two', {command: command, message: errors.errorTypes.listNameInvalid}) })
  })

  describe('addListItem', function () {
    const command = languageProcessor.commandTypes.addListItem
    it('✅ add item with cachedListName', function () { textShouldResult('add item', {command: command, list: 'cachedlistname', supplementaryText: 'item'}, 'cachedListName') })
    it('❌ add item with no cachedListName', function () { textShouldError('add item', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('✅ #list add item', function () { textShouldResult('#list add item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list add multiple items', function () { textShouldResult('#list add item1, item2, item3', {command: command, list: 'list', supplementaryText: 'item1, item2, item3'}) })
    it('✅ list add item', function () { textShouldResult('list add item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ list append item', function () { textShouldResult('list append item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list add item with cachedListName', function () { textShouldResult('#list add item', {command: command, list: 'list', supplementaryText: 'item'}, 'cachedListName') })
    it('✅ add item to list - with no cachedListName', function () { textShouldResult('add item to #list', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ add multiple item to list - with no cachedListName', function () { textShouldResult('add item1 item2 item3 to #list', {command: command, list: 'list', supplementaryText: 'item1 item2 item3'}) })
    it('✅ add remove stuff - deliberate confusion', function () { textShouldResult('add remove stuff', {command: command, list: 'cachedlistname', supplementaryText: 'remove stuff'}, 'cachedListName') })
    it('✅ add remove stuff to x- deliberate confusion', function () { textShouldResult('add remove stuff to x', {command: command, list: 'x', supplementaryText: 'remove stuff'}, 'cachedListName') })
    it('✅ append remove stuff to x - deliberate confusion', function () { textShouldResult('append remove stuff to x', {command: command, list: 'x', supplementaryText: 'remove stuff'}, 'cachedListName') })
  })

  describe('removeListItem', function () {
    const command = languageProcessor.commandTypes.removeListItem
    it('✅ remove item with cachedListName', function () { textShouldResult('remove item', {command: command, list: 'cachedlistname', supplementaryText: 'item'}, 'cachedListName') })
    it('❌ remove item with no cachedListName', function () { textShouldError('remove item', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('✅ #list remove item', function () { textShouldResult('#list remove item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list remove multiple items', function () { textShouldResult('#list remove item1, item2, item3', {command: command, list: 'list', supplementaryText: 'item1, item2, item3'}) })
    it('✅ list remove item', function () { textShouldResult('list remove item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list remove item with cachedListName', function () { textShouldResult('#list remove item', {command: command, list: 'list', supplementaryText: 'item'}, 'cachedListName') })
    it('✅ remove item from list - with no cachedListName', function () { textShouldResult('remove item from #list', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ remove multiple item from list - with no cachedListName', function () { textShouldResult('remove item1 item2 item3 from #list', {command: command, list: 'list', supplementaryText: 'item1 item2 item3'}) })
    it('✅ #list REMOVE item', function () { textShouldResult('#list REMOVE item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ remove item FROM list - with no cachedListName', function () { textShouldResult('remove item FROM #list', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ remove add stuff - deliberate confusion', function () { textShouldResult('remove add stuff', {command: command, list: 'cachedlistname', supplementaryText: 'add stuff'}, 'cachedListName') })
    it('✅ remove add stuff from  x - deliberate confusion', function () { textShouldResult('remove add stuff from x', {command: command, list: 'x', supplementaryText: 'add stuff'}, 'cachedListName') })
  })

  describe('clearList', function () {
    const command = languageProcessor.commandTypes.clearList
    it('✅ clear #list', function () { textShouldResult('clear #list', {command: command, list: 'list'}) })
    it('✅ empty #list', function () { textShouldResult('empty #list', {command: command, list: 'list'}) })
    it('✅ flush #list', function () { textShouldResult('flush #list', {command: command, list: 'list'}) })
    it('✅ clear list', function () { textShouldResult('clear list', {command: command, list: 'list'}) })
    it('✅ CLEar List', function () { textShouldResult('CLEar SomeThing', {command: command, list: 'something'}) })
    it('✅ clear + cached listname', function () { textShouldResult('clear', {command: command, list: 'cachedlistname'}, 'cachedListName') })
    it('❌ clear', function () { textShouldError('clear', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('❌ clear one two', function () { textShouldError('clear one two', {command: command, message: errors.errorTypes.listNameInvalid}) })
  })

  describe('deleteList', function () {
    const command = languageProcessor.commandTypes.deleteList
    it('✅ delete #list', function () { textShouldResult('delete #list', {command: command, list: 'list'}) })
    it('✅ delete list', function () { textShouldResult('delete list', {command: command, list: 'list'}) })
    it('❌ delete + cached listname', function () { textShouldError('delete', {command: command, list: null, message: errors.errorTypes.noList}, 'cachedListName') })
    it('❌ delete', function () { textShouldError('delete', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('❌ delete one two', function () { textShouldError('delete one two', {command: command, message: errors.errorTypes.listNameInvalid}) })
  })

  describe('sendList', function () {
    const command = languageProcessor.commandTypes.sendList
    it('✅ send @someone #list without cache', function () { textShouldResult('send @someone #list', {command: command, list: 'list', person: 'someone'}) })
    it('✅ send @someone #list with cache', function () { textShouldResult('send @someone #list', {command: command, list: 'list', person: 'someone'}, 'cachedListName') })
    it('✅ send @someone', function () { textShouldResult('send @someone', {command: command, list: 'cachedlistname', person: 'someone'}, 'cachedListName') })
    it('✅ send someone list', function () { textShouldResult('send someone list', {command: command, list: 'list', person: 'someone'}, 'cachedListName') })
    it('✅ send someone list hello', function () { textShouldResult('send someone list hello', {command: command, list: 'list', person: 'someone', supplementaryText: 'hello'}, 'cachedListName') })
    it('❌ send @someone no cache', function () { textShouldError('send @someone', {command: command, list: null, message: errors.errorTypes.noList}) })
    it('❌ send', function () { textShouldError('send', {command: command, list: null, message: errors.errorTypes.noPerson}) })
    it('❌ send #list', function () { textShouldError('send #list', {command: command, list: null, message: errors.errorTypes.noPerson}) })
    it('✅ send list to someone', function () { textShouldResult('send list to someone', {command: command, list: 'list', person: 'someone'}, 'cachedListName') })
    it('✅ send #list to @someone', function () { textShouldResult('send list to someone', {command: command, list: 'list', person: 'someone'}, 'cachedListName') })
    it('✅ send list hello to someone', function () { textShouldResult('send list hello to someone', {command: command, list: 'list', person: 'someone', supplementaryText: 'hello'}, 'cachedListName') })
    it('✅ send list hello goodbye to someone', function () { textShouldResult('send list hello goodbye to someone', {command: command, list: 'list', person: 'someone', supplementaryText: 'hello goodbye'}, 'cachedListName') })
  })

  describe('addReminder', function () {
    const command = languageProcessor.commandTypes.addReminder
    it('✅ remind @me tomorrow hello', function () { textShouldResult('remind @me tomorrow hello', {command: command}) })
  })

  describe('help', function () {
    const command = languageProcessor.commandTypes.help
    it('✅ packhack', function () { textShouldResult('packhack', {command: command}) })
  })

  describe('pushIntro', function () {
    const command = languageProcessor.commandTypes.pushIntro
    it('✅ **welcome 1', function () { textShouldResult('**welcome 1', {command: command}) })
  })

  describe('promsify languageProcessor', function () {
    it('resolve', function () {
      return Q.resolve(languageProcessor.processLanguagePromise({originalText: 'get list'}))
      .then(function (result) {
        result.command.should.equal(languageProcessor.commandTypes.getList)
        result.list.should.equal('list')
      }, function (error) {
        should.fail('should fail, instead: ' + error)
      })
    })

    it('reject', function () {
      return Q.resolve(languageProcessor.processLanguagePromise({originalText: 'nonsense and more nonsense'}))
      .then(function (result) {
        should.fail('should fail')
      }, function (error) {
        error.errorMessage.should.equal(errors.errorTypes.unrecognizedCommand)
      })
    })
  })
})
