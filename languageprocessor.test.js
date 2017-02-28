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
    actualResult.validateList.should.equal(expectedResult.validateList)
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
    it('✅ create #list', function () { textShouldResult('create #list', {command: 'createList', list: 'list', validateList: false}) })
    it('✅ create list', function () { textShouldResult('create list', {command: 'createList', list: 'list', validateList: false}) })
    it('✅ CREATE Something', function () { textShouldResult('CREATE SomeThing', {command: 'createList', list: 'something', validateList: false}) })
    it('✅ create with special characters', function () { textShouldResult('create 👍❤️😜!@#$%^&*()', {command: 'createList', list: '👍❤️😜!@#$%^&*()', validateList: false}) })
    it('❌ create #get', function () { textShouldError('create #get', languageProcessor.errorTypes.listNameInvalid) })
    it('❌ create #create', function () { textShouldError('create #create', languageProcessor.errorTypes.listNameInvalid) })
    it('❌ create', function () { textShouldError('create', languageProcessor.errorTypes.noList) })
    it('❌ create only with cachedListName', function () { textShouldError('create', languageProcessor.errorTypes.noList) }, 'cachedListName')
    it('❌ create #list with multiple words', function () { textShouldError('create #list with multiple words', languageProcessor.errorTypes.listNameInvalid) })
  })

  describe('getList', function () {
    it('✅ get #list', function () { textShouldResult('get #list', {command: 'getList', list: 'list', validateList: true}) })
    it('✅ get list', function () { textShouldResult('get list', {command: 'getList', list: 'list', validateList: true}) })
    it('✅ get list now', function () { textShouldResult('get list now', {command: 'getList', list: 'list', validateList: true}) })
    it('✅ show #list', function () { textShouldResult('show #list', {command: 'getList', list: 'list', validateList: true}) })
    it('✅ display lisT', function () { textShouldResult('display lisT', {command: 'getList', list: 'list', validateList: true}) })
    it('✅ get + cached listname', function () { textShouldResult('get', {command: 'getList', list: 'cachedListName', validateList: true}, 'cachedListName') })
    it('✅ get #stuff + cached listname', function () { textShouldResult('get #stuff', {command: 'getList', list: 'stuff', validateList: true}, 'cachedListName') })
    it('❌ get', function () { textShouldError('get', languageProcessor.errorTypes.noList) })
  })

  describe('addListItem', function () {
    it('✅ add item with cachedListName', function () { textShouldResult('add item', {command: 'addListItem', list: 'cachedListName', validateList: true}, 'cachedListName') })
    it('❌ add item with no cachedListName', function () { textShouldError('add item', languageProcessor.errorTypes.noList) })
    it('✅ #list add item', function () { textShouldResult('#list add item', {command: 'addListItem', list: 'list', validateList: true}) })
    it('✅ list add item', function () { textShouldResult('list add item', {command: 'addListItem', list: 'list', validateList: true}) })
    it('✅ #list add item with cachedListName', function () { textShouldResult('#list add item', {command: 'addListItem', list: 'list', validateList: true}, 'cachedListName') })
    it('✅ add item from list - with no cachedListName', function () { textShouldResult('add item to #list', {command: 'addListItem', list: 'list', validateList: true}) })
  })

  describe('clearList', function () {
    it('✅ clear #list', function () { textShouldResult('clear #list', {command: 'clearList', list: 'list', validateList: true}) })
    it('✅ empty #list', function () { textShouldResult('empty #list', {command: 'clearList', list: 'list', validateList: true}) })
    it('✅ flush #list', function () { textShouldResult('flush #list', {command: 'clearList', list: 'list', validateList: true}) })
    it('✅ clear list', function () { textShouldResult('clear list', {command: 'clearList', list: 'list', validateList: true}) })
    it('✅ CLEar List', function () { textShouldResult('CLEar SomeThing', {command: 'clearList', list: 'something', validateList: true}) })
    it('✅ clear + cached listname', function () { textShouldResult('clear', {command: 'clearList', list: 'cachedListName', validateList: true}, 'cachedListName') })
    it('❌ clear', function () { textShouldError('clear', languageProcessor.errorTypes.noList) })
  })
})
