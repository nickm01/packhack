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

  describe('when retrieving person from phone number', () => {
    afterEach(() => {
      familyMembersPromises.findFromPhoneNumberPromise.restore()
    })

    it('should find if there is one result', () => {
      const data = {fromPhoneNumber: '+15555555555'}
      const foundPersons = [{name: 'jack', familyId: '1', timeZone: 'America/Chicago'}]
      sinon.stub(familyMembersPromises, 'findFromPhoneNumberPromise').callsFake(() => {
        return Q.resolve(foundPersons)
      })
      return familyMembers.retrievePersonFromPhoneNumberPromise(data)
        .then(result => {
          result.fromPerson.should.equal('jack')
          result.familyId.should.equal('1')
          result.timezone.should.equal('America/Chicago')
        })
    })

    it('should default to new york if no timezone', () => {
      const data = {fromPhoneNumber: '+15555555555'}
      const foundPersons = [{name: 'jack', familyId: '1'}]
      sinon.stub(familyMembersPromises, 'findFromPhoneNumberPromise').callsFake(() => {
        return Q.resolve(foundPersons)
      })
      return familyMembers.retrievePersonFromPhoneNumberPromise(data)
        .then(result => {
          result.timezone.should.equal('America/New_York')
        })
    })

    it('should error if no result', () => {
      const data = {fromPhoneNumber: '+15555555555'}
      sinon.stub(familyMembersPromises, 'findFromPhoneNumberPromise').callsFake(() => {
        return Q.resolve([])
      })
      return familyMembers.retrievePersonFromPhoneNumberPromise(data)
      .then(result => {
        should.fail('expecting error')
      }, result => {
        result.errorMessage.should.equal(modelConstants.errorTypes.personNotFound)
      })
    })

    it('should error if database errors', () => {
      const data = {fromPhoneNumber: '+15555555555'}
      sinon.stub(familyMembersPromises, 'findFromPhoneNumberPromise').callsFake(() => {
        return Q.reject([])
      })
      return familyMembers.retrievePersonFromPhoneNumberPromise(data)
      .then(result => {
        should.fail('expecting error')
      }, result => {
        result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
      })
    })
  })
})
