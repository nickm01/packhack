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

  describe('splitByCommasAndsDoubleSpaces', () => {
    it('one', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one')
      result.length.should.equal(1)
      result[0].should.equal('one')
    })
    it('one,two', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one,two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it(' one, two', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces(' one, two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one, two, three-three', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one, two, three-three')
      result.length.should.equal(3)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three-three')
    })
    it('nothing', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('')
      result.length.should.equal(0)
    })
    it(' one,two,', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces(' one,two,')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it(' one, ,two', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces(' one, ,two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one and two', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one and two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one, two and three,', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one, two and three')
      result.length.should.equal(3)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three')
    })
    it('one  two', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one  two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two')
    })
    it('one  two two', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one  two two')
      result.length.should.equal(2)
      result[0].should.equal('one')
      result[1].should.equal('two two')
    })
    it('one, two and ,three  four ', () => {
      const result = stringProcessor.splitByCommasAndsDoubleSpaces('one, two and ,three three  four ')
      result.length.should.equal(4)
      result[0].should.equal('one')
      result[1].should.equal('two')
      result[2].should.equal('three three')
      result[3].should.equal('four')
    })
  })
})
