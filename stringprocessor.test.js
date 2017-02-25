/* eslint-env mocha */

const stringProcessor = require('./stringprocessor')
const should = require('chai').should()

describe('stringProcessor', function () {
  beforeEach(() => {
  })

  describe('get words', function () {
    it('no words', function () { stringProcessor.stringToWords('').length.should.equal(0) })
    it('null', function () { stringProcessor.stringToWords().length.should.equal(0) })
    it('one word', function () { stringProcessor.stringToWords('hello').length.should.equal(1) })
    it('two words', function () { stringProcessor.stringToWords('hello me').length.should.equal(2) })
    it('complex sentence', function () { stringProcessor.stringToWords("This is super-fab, I'd say!").length.should.equal(5) })
  })
})
