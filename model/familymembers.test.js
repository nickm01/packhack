/* eslint-env mocha */
// Above line makes it work with Mocha
const familyMembers = require('./familymembers')
const familyMembersPromises = require('./familymembers.promises')
const should = require('chai').should()
const sinon = require('sinon')
const Q = require('q')
//const modelConstants = require('./modelconstants')

describe.only('familyMembers', () => {
  describe('when retrieving person phone number', () => {
    afterEach(() => {
      familyMembersPromises.findFromNamePromise.restore()
    })

    it('should find if there is one result', () => {
      const members = [{phoneNumber: '999'}]
      const data = [{person: 'nick', familyId: 123}]
      sinon.stub(familyMembersPromises, 'findFromNamePromise').callsFake(() => {
        return Q.resolve(members)
      })
      return familyMembers.retrievePersonPhoneNumbersPromise(data)
        .then(result => {
          result.sendToPhoneNumbers[0].should.equal('999')
        })
    })

    it('should error if there no one result')
    it('should return multiple if all')
  })
})
