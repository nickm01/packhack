/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const languageProcessor = require('./languageProcessor')

describe('languageProcessor', function () {
  beforeEach(() => {
  })

  describe('get', function () {
    it('simple get with #', function () {
      const result = languageProcessor.processText('get #list')
      result.command.should.equal('get')
      result.list.should.equal('list')
      result.validateList.should.equal(true)
    })

    it('simple get without #', function () {
      const result = languageProcessor.processText('get list')
      result.command.should.equal('get')
      result.list.should.equal('list')
      result.validateList.should.equal(true)
    })

    it('simple alternative get', function () {
      const result = languageProcessor.processText('show #list')
      result.command.should.equal('get')
      result.list.should.equal('list')
      result.validateList.should.equal(true)
    })

    it('nothing', function () {
      const resultFunction = () => { languageProcessor.processText('') }
      resultFunction.should.throw(languageProcessor.errorTypes.noText)
    })

    it('one word but not a command', function () {
      const resultFunction = () => { languageProcessor.processText('yipppeeee') }
      resultFunction.should.throw(languageProcessor.errorTypes.unrecognizedCommandCouldBeList)
    })

    it('two word nonsense', function () {
      const resultFunction = () => { languageProcessor.processText('yipppeeee whippeee') }
      resultFunction.should.throw(languageProcessor.errorTypes.unrecognizedCommand)
    })

    it('get with cached listname', function () {
      const result = languageProcessor.processText('get', 'shopping')
      result.command.should.equal('get')
      result.list.should.equal('shopping')
      result.validateList.should.equal(true)
    })

    it('get with 2nd word and cached listname', function () {
      const result = languageProcessor.processText('get #stuff', 'shopping')
      result.command.should.equal('get')
      result.list.should.equal('stuff')
      result.validateList.should.equal(true)
    })

    it('get with no second word and no cach', function () {
      const resultFunction = () => { languageProcessor.processText('get', '') }
      resultFunction.should.throw(languageProcessor.errorTypes.noList)
    })

    it('get with no second word and no cach', function () {
      const resultFunction = () => { languageProcessor.processText('get', '') }
      resultFunction.should.throw(languageProcessor.errorTypes.noList)
    })
  })
})
