/* eslint-env mocha */
// Above line makes it work with Mocha
const familyMembers = require('./familymembers')
const familyMembersPromises = require('./familymembers.promises')
const should = require('chai').should()
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('./modelconstants')

describe('familyMembers', () => {
  describe('when retrieving person phone number', () => {
    afterEach(() => {
      familyMembersPromises.findFromNameFamilyPromise.restore()
    })

    it('should find if there is one result', () => {
      const members = [{phoneNumber: '999'}]
      const data = {person: 'nick', familyId: 123}
      sinon.stub(familyMembersPromises, 'findFromNameFamilyPromise').callsFake(() => {
        return Q.resolve(members)
      })
      return familyMembers.retrievePersonPhoneNumbersPromise(data)
        .then(result => {
          result.phoneNumbers[0].should.equal('999')
        })
    })

    it('should error if no result', () => {
      const members = []
      const data = {person: 'nick', familyId: 123, someData: 'sausages'}
      sinon.stub(familyMembersPromises, 'findFromNameFamilyPromise').callsFake(() => {
        return Q.resolve(members)
      })
      return familyMembers.retrievePersonPhoneNumbersPromise(data)
      .then(result => {
        should.fail('expecting error')
      }, result => {
        result.errorMessage.should.equal(modelConstants.errorTypes.personNotFound)
        result.someData.should.equal('sausages')
        should.not.exist(result.phoneNumbers)
      })
    })

    it('should return multiple if all', () => {
      const members = [{phoneNumber: '999'}, {phoneNumber: '666'}]
      const data = {person: 'nick', familyId: 123}
      sinon.stub(familyMembersPromises, 'findFromNameFamilyPromise').callsFake(() => {
        return Q.resolve(members)
      })
      return familyMembers.retrievePersonPhoneNumbersPromise(data)
        .then(result => {
          result.phoneNumbers.length.should.equal(2)
          result.phoneNumbers[0].should.equal('999')
          result.phoneNumbers[1].should.equal('666')
        })
    })
    it('should error if database errors', () => {
      const members = []
      const data = {person: 'nick', familyId: 123, someData: 'sausages'}
      sinon.stub(familyMembersPromises, 'findFromNameFamilyPromise').callsFake(() => {
        return Q.reject(members)
      })
      return familyMembers.retrievePersonPhoneNumbersPromise(data)
      .then(result => {
        should.fail('expecting error')
      }, result => {
        result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
        result.someData.should.equal('sausages')
        should.not.exist(result.phoneNumbers)
      })
    })
  })
})
