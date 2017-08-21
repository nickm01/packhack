/* eslint-env mocha */

const stringProcessor = require('./stringprocessor')
const should = require('chai').should()

describe('stringProcessor', function () {
  describe('get words', function () {
    it('no words', function () { stringProcessor.stringToWords('').length.should.equal(0) })
    it('null', function () { stringProcessor.stringToWords().length.should.equal(0) })
    it('one word', function () { stringProcessor.stringToWords('hello').length.should.equal(1) })
    it('two words', function () { stringProcessor.stringToWords('hello me').length.should.equal(2) })
    it('complex sentence', function () { stringProcessor.stringToWords("This is super-fab, I'd say!").length.should.equal(5) })
  })

  describe('splitByDelimiters', () => {
    it('one', () => {
      const result = stringProcessor.splitByDelimiters('one')
      result.length.should.equal(1)
      result[0].should.equal('one')
    })
    it('one,two', () => {
      const result = stringProcessor.splitByDelimiters('one,two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it(' one, two', () => {
      const result = stringProcessor.splitByDelimiters(' one, two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one, two, three-three', () => {
      const result = stringProcessor.splitByDelimiters('one, two, three-three')
      result.length.should.equal(3)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three-three')
    })
    it('nothing', () => {
      const result = stringProcessor.splitByDelimiters('')
      result.length.should.equal(0)
    })
    it(' one,two,', () => {
      const result = stringProcessor.splitByDelimiters(' one,two,')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it(' one, ,two', () => {
      const result = stringProcessor.splitByDelimiters(' one, ,two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one and two', () => {
      const result = stringProcessor.splitByDelimiters('one and two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one, two and three,', () => {
      const result = stringProcessor.splitByDelimiters('one, two and three')
      result.length.should.equal(3)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three')
    })
    it('one  two', () => {
      const result = stringProcessor.splitByDelimiters('one  two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one  two two', () => {
      const result = stringProcessor.splitByDelimiters('one  two two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two two')
    })
    it('one  two  three  four', () => {
      const result = stringProcessor.splitByDelimiters('one  two  three  four')
      result.length.should.equal(4)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three')
      result[3].should.equal('four')
    })
    it('one. two. three and four', () => {
      const result = stringProcessor.splitByDelimiters('one  two  three  four')
      result.length.should.equal(4)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three')
      result[3].should.equal('four')
    })
    it('one, two and ,three three  four. five six.six', () => {
      const result = stringProcessor.splitByDelimiters('one, two and ,three three  four. five  six.six')
      result.length.should.equal(6)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three three')
      result[3].should.equal('four')
      result[4].should.equal('five')
      result[5].should.equal('six.six')
    })
    it('new line test', () => {
      const result = stringProcessor.splitByDelimiters('one\ntwo  three\nfour\n')
      result.length.should.equal(4)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three')
      result[3].should.equal('four')
    })
    it('carriage return test', () => {
      const result = stringProcessor.splitByDelimiters('one\r\ntwo\nthree\r\nfour')
      result.length.should.equal(4)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three')
      result[3].should.equal('four')
    })
  })

  describe('allNumeric', () => {
    it("'1','2','3' > true", () => {
      stringProcessor.allNumeric(['1', '2', '3']).should.equal(true)
    })
    it("'100','2','3' > true", () => {
      stringProcessor.allNumeric(['100', '2', '3']).should.equal(true)
    })
    it('1, 2, 3 > true', () => {
      stringProcessor.allNumeric([1, 2, 3]).should.equal(true)
    })
    it("'1','2','A' > false", () => {
      stringProcessor.allNumeric(['1', '2', 'A']).should.equal(false)
    })
    it("'!@$#_{:}','2','3' > false", () => {
      stringProcessor.allNumeric(['!@$#_{:}', '2', 'A']).should.equal(false)
    })
    it("'1','🤔❤️🍾','3' > false", () => {
      stringProcessor.allNumeric(['1', '🤔❤️🍾', '3']).should.equal(false)
    })
  })
})
