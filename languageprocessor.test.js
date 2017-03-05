/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const languageProcessor = require('./languageProcessor')

// This is a help these unit tests be more succinct
const textShouldResult = (text, expectedResult, cachedListName) => {
  const actualResult = languageProcessor.processText(text, cachedListName)
  actualResult.command.should.equal(expectedResult.command)
  if (actualResult.hasOwnProperty('list') && actualResult.list) {
    actualResult.list.should.equal(expectedResult.list)
  }
}

const textShouldError = (text, expectedError) => {
  const resultFunction = () => { languageProcessor.processText(text) }
  resultFunction.should.throw(expectedError)
}

describe('languageProcessor', function () {
  beforeEach(() => {
  })

  describe('basics', function () {
    it('❌ nothing', function () { textShouldError('', languageProcessor.errorTypes.noText) })
    it('❌ one word but not a command', function () { textShouldError('yippeeee', languageProcessor.errorTypes.unrecognizedCommandCouldBeList) })
    it('❌ getshopping', function () { textShouldError('getshopping', languageProcessor.errorTypes.unrecognizedCommandCouldBeList) })
    it('❌ two word nonsense', function () { textShouldError('yipppeeee whippeee', languageProcessor.errorTypes.unrecognizedCommand) })
  })

  describe('getLists', function () {
    it('✅ lists', function () { textShouldResult('lists', {command: 'getlists'}) })
    it('✅ get lists', function () { textShouldResult('get lists', {command: 'getlists'}) })
    it('✅ Get Lists', function () { textShouldResult('Get Lists', {command: 'getlists'}) })
    it('✅ show lists', function () { textShouldResult('show lists', {command: 'getlists'}) })
    it('✅ display lists', function () { textShouldResult('display lists', {command: 'getlists'}) })
    it('❌ getlists', function () { textShouldError('getlists', languageProcessor.errorTypes.unrecognizedCommandCouldBeList) })
  })

  describe('createList', function () {
    it('✅ create #list', function () { textShouldResult('create #list', {command: 'createList', list: 'list'}) })
    it('✅ create list', function () { textShouldResult('create list', {command: 'createList', list: 'list'}) })
    it('✅ CREATE Something', function () { textShouldResult('CREATE SomeThing', {command: 'createList', list: 'something'}) })
    it('✅ create with special characters', function () { textShouldResult('create 👍❤️😜!@#$%^&*()', {command: 'createList', list: '👍❤️😜!@#$%^&*()'}) })
    it('❌ create #get', function () { textShouldError('create #get', languageProcessor.errorTypes.listNameInvalid) })
    it('❌ create #create', function () { textShouldError('create #create', languageProcessor.errorTypes.listNameInvalid) })
    it('❌ create', function () { textShouldError('create', languageProcessor.errorTypes.noList) })
    it('❌ create only with cachedListName', function () { textShouldError('create', languageProcessor.errorTypes.noList) }, 'cachedListName')
    it('❌ create #list with multiple words', function () { textShouldError('create #list with multiple words', languageProcessor.errorTypes.listNameInvalid) })
  })

  describe('getList', function () {
    it('✅ get #list', function () { textShouldResult('get #list', {command: 'getList', list: 'list'}) })
    it('✅ get list', function () { textShouldResult('get list', {command: 'getList', list: 'list'}) })
    it('✅ get list now', function () { textShouldResult('get list now', {command: 'getList', list: 'list'}) })
    it('✅ show #list', function () { textShouldResult('show #list', {command: 'getList', list: 'list'}) })
    it('✅ display lisT', function () { textShouldResult('display lisT', {command: 'getList', list: 'list'}) })
    it('✅ get + cached listname', function () { textShouldResult('get', {command: 'getList', list: 'cachedlistname'}, 'cachedListName') })
    it('✅ get #stuff + cached listname', function () { textShouldResult('get #stuff', {command: 'getList', list: 'stuff'}, 'cachedListName') })
    it('❌ get', function () { textShouldError('get', languageProcessor.errorTypes.noList) })
  })

  describe('addListItem', function () {
    it('✅ add item with cachedListName', function () { textShouldResult('add item', {command: 'addListItem', list: 'cachedlistname'}, 'cachedListName') })
    it('❌ add item with no cachedListName', function () { textShouldError('add item', languageProcessor.errorTypes.noList) })
    it('✅ #list add item', function () { textShouldResult('#list add item', {command: 'addListItem', list: 'list'}) })
    it('✅ list add item', function () { textShouldResult('list add item', {command: 'addListItem', list: 'list'}) })
    it('✅ #list add item with cachedListName', function () { textShouldResult('#list add item', {command: 'addListItem', list: 'list'}, 'cachedListName') })
    it('✅ add item from list - with no cachedListName', function () { textShouldResult('add item to #list', {command: 'addListItem', list: 'list'}) })
  })

  describe('clearList', function () {
    it('✅ clear #list', function () { textShouldResult('clear #list', {command: 'clearList', list: 'list'}) })
    it('✅ empty #list', function () { textShouldResult('empty #list', {command: 'clearList', list: 'list'}) })
    it('✅ flush #list', function () { textShouldResult('flush #list', {command: 'clearList', list: 'list'}) })
    it('✅ clear list', function () { textShouldResult('clear list', {command: 'clearList', list: 'list'}) })
    it('✅ CLEar List', function () { textShouldResult('CLEar SomeThing', {command: 'clearList', list: 'something'}) })
    it('✅ clear + cached listname', function () { textShouldResult('clear', {command: 'clearList', list: 'cachedlistname'}, 'cachedListName') })
    it('❌ clear', function () { textShouldError('clear', languageProcessor.errorTypes.noList) })
  })
})
