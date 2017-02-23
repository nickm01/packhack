/* eslint-env mocha */
// Above line makes it work with Mocha

//const languageProcessor = require('./languageProcessor')

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

    it('simple get2', function (done) {
      // const result = languageProcessor.processText('get')
      var hello = 'hello'
      hello.should.equal('hello')
      done()
    })
  })
})
