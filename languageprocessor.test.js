/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const languageProcessor = require('./languageProcessor')

// This is a help these unit tests be more succinct
const textShouldResult = (text, expectedResult, cachedListName) => {
  const actualResult = languageProcessor.processText(text, cachedListName)
  actualResult.command.should.equal(expectedResult.command)
  if (actualResult.list) {
    actualResult.list.should.equal(expectedResult.list)
  }
}

const textShouldError = (text, expectedResult) => {
  try {
    languageProcessor.processText(text)
    should.fail('should fail')
  } catch (exception) {
    exception.message.should.equal(expectedResult.message)
    exception.originalText.should.equal(text)
    if (expectedResult.command) {
      exception.command.should.equal(expectedResult.command)
    }
    if (expectedResult.words) {
      exception.words.should.equal(expectedResult.words)
    }
    if (expectedResult.list) {
      exception.list.should.equal(expectedResult.list)
    }
  }
}

describe('languageProcessor', function () {
  beforeEach(() => {
  })

  describe('basics', function () {
    it('❌ nothing', function () { textShouldError('', {command: null, list: null, message: languageProcessor.errorTypes.noText}) })
    it('❌ one word but not a command', function () { textShouldError('yippeeee', {command: null, list: null, message: languageProcessor.errorTypes.unrecognizedCommandCouldBeList}) })
    it('❌ getshopping', function () { textShouldError('getshopping', {command: null, list: null, message: languageProcessor.errorTypes.unrecognizedCommandCouldBeList}) })
    it('❌ two word nonsense', function () { textShouldError('yipppeeee whippeee', {command: null, list: null, message: languageProcessor.errorTypes.unrecognizedCommand}) })
  })

  describe('getLists', function () {
    it('✅ lists', function () { textShouldResult('lists', {command: languageProcessor.commandTypes.getlists}) })
    it('✅ get lists', function () { textShouldResult('get lists', {command: languageProcessor.commandTypes.getlists}) })
    it('✅ Get Lists', function () { textShouldResult('Get Lists', {command: languageProcessor.commandTypes.getlists}) })
    it('✅ show lists', function () { textShouldResult('show lists', {command: languageProcessor.commandTypes.getlists}) })
    it('✅ display lists', function () { textShouldResult('display lists', {command: languageProcessor.commandTypes.getlists}) })
    it('❌ getlists', function () { textShouldError('getlists', {command: null, list: null, message: languageProcessor.errorTypes.unrecognizedCommandCouldBeList}) })
  })

  describe('createList', function () {
    it('✅ create #list', function () { textShouldResult('create #list', {command: languageProcessor.commandTypes.createList, list: 'list'}) })
    it('✅ create list', function () { textShouldResult('create list', {command: languageProcessor.commandTypes.createList, list: 'list'}) })
    it('✅ CREATE Something', function () { textShouldResult('CREATE SomeThing', {command: languageProcessor.commandTypes.createList, list: 'something'}) })
    it('✅ create with special characters', function () { textShouldResult('create 👍❤️😜!@#$%^&*()', {command: languageProcessor.commandTypes.createList, list: '👍❤️😜!@#$%^&*()'}) })
    it('❌ create #get', function () { textShouldError('create #get', {command: languageProcessor.commandTypes.createList, list: null, message: languageProcessor.errorTypes.listNameInvalid}) })
    it('❌ create #create', function () { textShouldError('create #create', {command: languageProcessor.commandTypes.createList, list: null, message: languageProcessor.errorTypes.listNameInvalid}) })
    it('❌ create', function () { textShouldError('create', {command: languageProcessor.commandTypes.createList, list: null, message: languageProcessor.errorTypes.noList}) })
    it('❌ create only with cachedListName', function () { textShouldError('create', {command: languageProcessor.commandTypes.createList, list: null, message: languageProcessor.errorTypes.noList}) }, 'cachedListName')
    it('❌ create #list with multiple words', function () { textShouldError('create #list with multiple words', {command: languageProcessor.commandTypes.createList, list: null, message: languageProcessor.errorTypes.listNameInvalid}) })
  })

  describe('getList', function () {
    it('✅ get #list', function () { textShouldResult('get #list', {command: languageProcessor.commandTypes.getList, list: 'list'}) })
    it('✅ get list', function () { textShouldResult('get list', {command: languageProcessor.commandTypes.getList, list: 'list'}) })
    it('✅ get list now', function () { textShouldResult('get list now', {command: languageProcessor.commandTypes.getList, list: 'list'}) })
    it('✅ show #list', function () { textShouldResult('show #list', {command: languageProcessor.commandTypes.getList, list: 'list'}) })
    it('✅ display lisT', function () { textShouldResult('display lisT', {command: languageProcessor.commandTypes.getList, list: 'list'}) })
    it('✅ get + cached listname', function () { textShouldResult('get', {command: languageProcessor.commandTypes.getList, list: 'cachedlistname'}, 'cachedListName') })
    it('✅ get #stuff + cached listname', function () { textShouldResult('get #stuff', {command: languageProcessor.commandTypes.getList, list: 'stuff'}, 'cachedListName') })
    it('❌ get', function () { textShouldError('get', {command: languageProcessor.commandTypes.getList, list: null, message: languageProcessor.errorTypes.noList}) })
  })

  describe('addListItem', function () {
    it('✅ add item with cachedListName', function () { textShouldResult('add item', {command: languageProcessor.commandTypes.addListItem, list: 'cachedlistname'}, 'cachedListName') })
    it('❌ add item with no cachedListName', function () { textShouldError('add item', {command: languageProcessor.commandTypes.addListItem, list: null, message: languageProcessor.errorTypes.noList}) })
    it('✅ #list add item', function () { textShouldResult('#list add item', {command: languageProcessor.commandTypes.addListItem, list: 'list'}) })
    it('✅ list add item', function () { textShouldResult('list add item', {command: languageProcessor.commandTypes.addListItem, list: 'list'}) })
    it('✅ #list add item with cachedListName', function () { textShouldResult('#list add item', {command: languageProcessor.commandTypes.addListItem, list: 'list'}, 'cachedListName') })
    it('✅ add item from list - with no cachedListName', function () { textShouldResult('add item to #list', {command: languageProcessor.commandTypes.addListItem, list: 'list'}) })
  })

  describe('clearList', function () {
    it('✅ clear #list', function () { textShouldResult('clear #list', {command: languageProcessor.commandTypes.clearList, list: 'list'}) })
    it('✅ empty #list', function () { textShouldResult('empty #list', {command: languageProcessor.commandTypes.clearList, list: 'list'}) })
    it('✅ flush #list', function () { textShouldResult('flush #list', {command: languageProcessor.commandTypes.clearList, list: 'list'}) })
    it('✅ clear list', function () { textShouldResult('clear list', {command: languageProcessor.commandTypes.clearList, list: 'list'}) })
    it('✅ CLEar List', function () { textShouldResult('CLEar SomeThing', {command: languageProcessor.commandTypes.clearList, list: 'something'}) })
    it('✅ clear + cached listname', function () { textShouldResult('clear', {command: languageProcessor.commandTypes.clearList, list: 'cachedlistname'}, 'cachedListName') })
    it('❌ clear', function () { textShouldError('clear', {command: languageProcessor.commandTypes.clearList, list: null, message: languageProcessor.errorTypes.noList}) })
  })
})
