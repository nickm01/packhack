/* eslint-env mocha */
//const languageProcessor = require('./languageProcessor')
const should = require('chai').should()

describe('languageProcessor', function () {
  beforeEach(() => {
  })

  describe('initialization', function () {
    it('simple get', function (done) {
      // const result = languageProcessor.processText('get')
      var hello = 'hello'
      hello.should.equal('hello')
      done()
    })
  })
})
