/* eslint-env mocha */

const smsProcessor = require('./smsprocessor')
const should = require('chai').should()

describe('smsProcessor', function () {
  describe('validatePhoneNumber', function () {
    it('✅ +12125310060', function () { smsProcessor.validatePhoneNumber('+12125310060').should.equal(true) })
    it('✅ +13476979750', function () { smsProcessor.validatePhoneNumber('+13476979750').should.equal(true) })
    it('❌ 3476979750', function () { smsProcessor.validatePhoneNumber('3476979750').should.equal(false) })
    it('❌ 13476979750', function () { smsProcessor.validatePhoneNumber('13476979750').should.equal(false) })
    it('❌ 347697975', function () { smsProcessor.validatePhoneNumber('347697975').should.equal(false) })
    it('❌ 34769797501', function () { smsProcessor.validatePhoneNumber('34769797501').should.equal(false) })
    it('❌ +1347697975A', function () { smsProcessor.validatePhoneNumber('+1347697975A').should.equal(false) })
    it('❌ A13476979750', function () { smsProcessor.validatePhoneNumber('A13476979750').should.equal(false) })
    it('❌ +121253100601', function () { smsProcessor.validatePhoneNumber('+121253100601').should.equal(false) })
    it('❌ +23476979750', function () { smsProcessor.validatePhoneNumber('+23476979750').should.equal(false) })
  })
})
