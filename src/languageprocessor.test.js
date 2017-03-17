/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const languageProcessor = require('./languageProcessor')

// This is a help these unit tests be more succinct
const textShouldResult = (text, expectedResult, cachedListName) => {
  const actualResult = languageProcessor.processText(text, cachedListName)
  actualResult.command.should.equal(expectedResult.command)
  if (expectedResult.list) {
    actualResult.list.should.equal(expectedResult.list)
  }
  if (expectedResult.supplementaryText) {
    actualResult.supplementaryText.should.equal(expectedResult.supplementaryText)
  }
}

const textShouldError = (text, expectedResult, cachedListName) => {
  try {
    languageProcessor.processText(text, cachedListName)
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
    if (expectedResult.person) {
      exception.person.should.equal(expectedResult.person)
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
    const command = languageProcessor.commandTypes.getlists
    it('✅ lists', function () { textShouldResult('lists', {command: command}) })
    it('✅ get lists', function () { textShouldResult('get lists', {command: command}) })
    it('✅ Get Lists', function () { textShouldResult('Get Lists', {command: command}) })
    it('✅ show lists', function () { textShouldResult('show lists', {command: command}) })
    it('✅ display lists', function () { textShouldResult('display lists', {command: command}) })
    it('❌ getlists', function () { textShouldError('getlists', {command: null, list: null, message: languageProcessor.errorTypes.unrecognizedCommandCouldBeList}) })
  })

  describe('createList', function () {
    const command = languageProcessor.commandTypes.createList
    it('✅ create #list', function () { textShouldResult('create #list', {command: command, list: 'list'}) })
    it('✅ create list', function () { textShouldResult('create list', {command: command, list: 'list'}) })
    it('✅ CREATE Something', function () { textShouldResult('CREATE SomeThing', {command: command, list: 'something'}) })
    it('✅ create with special characters', function () { textShouldResult('create 👍❤️😜!@#$%^&*()', {command: command, list: '👍❤️😜!@#$%^&*()'}) })
    it('❌ create #get', function () { textShouldError('create #get', {command: command, list: null, message: languageProcessor.errorTypes.listNameInvalid}) })
    it('❌ create #create', function () { textShouldError('create #create', {command: command, list: null, message: languageProcessor.errorTypes.listNameInvalid}) })
    it('❌ create', function () { textShouldError('create', {command: command, list: null, message: languageProcessor.errorTypes.noList}) })
    it('❌ create only with cachedListName', function () { textShouldError('create', {command: command, list: null, message: languageProcessor.errorTypes.noList}) }, 'cachedListName')
    it('❌ create #list with multiple words', function () { textShouldError('create #list with multiple words', {command: command, list: null, message: languageProcessor.errorTypes.listNameInvalid}) })
  })

  describe('getList', function () {
    const command = languageProcessor.commandTypes.getList
    it('✅ get #list', function () { textShouldResult('get #list', {command: command, list: 'list'}) })
    it('✅ get list', function () { textShouldResult('get list', {command: command, list: 'list'}) })
    it('✅ get list now', function () { textShouldResult('get list now', {command: command, list: 'list'}) })
    it('✅ show #list', function () { textShouldResult('show #list', {command: command, list: 'list'}) })
    it('✅ display lisT', function () { textShouldResult('display lisT', {command: command, list: 'list'}) })
    it('✅ get + cached listname', function () { textShouldResult('get', {command: command, list: 'cachedlistname'}, 'cachedListName') })
    it('✅ get #stuff + cached listname', function () { textShouldResult('get #stuff', {command: command, list: 'stuff'}, 'cachedListName') })
    it('❌ get', function () { textShouldError('get', {command: command, list: null, message: languageProcessor.errorTypes.noList}) })
  })

  describe('addListItem', function () {
    const command = languageProcessor.commandTypes.addListItem
    it('✅ add item with cachedListName', function () { textShouldResult('add item', {command: command, list: 'cachedlistname', supplementaryText: 'item'}, 'cachedListName') })
    it('❌ add item with no cachedListName', function () { textShouldError('add item', {command: command, list: null, message: languageProcessor.errorTypes.noList}) })
    it('✅ #list add item', function () { textShouldResult('#list add item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list add multiple items', function () { textShouldResult('#list add item1, item2, item3', {command: command, list: 'list', supplementaryText: 'item1, item2, item3'}) })
    it('✅ list add item', function () { textShouldResult('list add item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ list append item', function () { textShouldResult('list append item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list add item with cachedListName', function () { textShouldResult('#list add item', {command: command, list: 'list', supplementaryText: 'item'}, 'cachedListName') })
    it('✅ add item to list - with no cachedListName', function () { textShouldResult('add item to #list', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ add multiple item to list - with no cachedListName', function () { textShouldResult('add item1 item2 item3 to #list', {command: command, list: 'list', supplementaryText: 'item1 item2 item3'}) })
  })

  describe('removeListItem', function () {
    const command = languageProcessor.commandTypes.removeListItem
    it('✅ remove item with cachedListName', function () { textShouldResult('remove item', {command: command, list: 'cachedlistname', supplementaryText: 'item'}, 'cachedListName') })
    it('❌ remove item with no cachedListName', function () { textShouldError('remove item', {command: command, list: null, message: languageProcessor.errorTypes.noList}) })
    it('✅ #list remove item', function () { textShouldResult('#list remove item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list remove multiple items', function () { textShouldResult('#list remove item1, item2, item3', {command: command, list: 'list', supplementaryText: 'item1, item2, item3'}) })
    it('✅ list remove item', function () { textShouldResult('list remove item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ #list remove item with cachedListName', function () { textShouldResult('#list remove item', {command: command, list: 'list', supplementaryText: 'item'}, 'cachedListName') })
    it('✅ remove item from list - with no cachedListName', function () { textShouldResult('remove item from #list', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ remove multiple item from list - with no cachedListName', function () { textShouldResult('remove item1 item2 item3 from #list', {command: command, list: 'list', supplementaryText: 'item1 item2 item3'}) })
    it('✅ #list REMOVE item', function () { textShouldResult('#list REMOVE item', {command: command, list: 'list', supplementaryText: 'item'}) })
    it('✅ remove item FROM list - with no cachedListName', function () { textShouldResult('remove item FROM #list', {command: command, list: 'list', supplementaryText: 'item'}) })
  })

  describe('clearList', function () {
    const command = languageProcessor.commandTypes.clearList
    it('✅ clear #list', function () { textShouldResult('clear #list', {command: command, list: 'list'}) })
    it('✅ empty #list', function () { textShouldResult('empty #list', {command: command, list: 'list'}) })
    it('✅ flush #list', function () { textShouldResult('flush #list', {command: command, list: 'list'}) })
    it('✅ clear list', function () { textShouldResult('clear list', {command: command, list: 'list'}) })
    it('✅ CLEar List', function () { textShouldResult('CLEar SomeThing', {command: command, list: 'something'}) })
    it('✅ clear + cached listname', function () { textShouldResult('clear', {command: command, list: 'cachedlistname'}, 'cachedListName') })
    it('❌ clear', function () { textShouldError('clear', {command: command, list: null, message: languageProcessor.errorTypes.noList}) })
  })

  describe('deleteList', function () {
    const command = languageProcessor.commandTypes.deleteList
    it('✅ delete #list', function () { textShouldResult('delete #list', {command: command, list: 'list'}) })
    it('✅ delete list', function () { textShouldResult('delete list', {command: command, list: 'list'}) })
    it('❌ delete + cached listname', function () { textShouldError('delete', {command: command, list: null, message: languageProcessor.errorTypes.noList}, 'cachedListName') })
    it('❌ delete', function () { textShouldError('delete', {command: command, list: null, message: languageProcessor.errorTypes.noList}) })
  })

  describe('sendList', function () {
    const command = languageProcessor.commandTypes.sendList
    it('✅ send @someone #list', function () { textShouldResult('send @someone #list', {command: command, list: 'list', person: 'someone'}) })
  })
})
