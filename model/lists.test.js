/* eslint-env mocha */
// Above line makes it work with Mocha
const lists = require('./lists')
const listsMongoPromises = require('./listsmongopromises')
const should = require('chai').should()
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('./modelconstants')

describe('lists', () => {
  describe('when validating list exists', () => {
    afterEach(() => {
      listsMongoPromises.listsFindOnePromise.restore()
    })

    it('should find if there is one result', () => {
      const singleElementArray = [{}]
      sinon.stub(listsMongoPromises, 'listsFindOnePromise').callsFake(function () {
        return Q.resolve(singleElementArray)
      })
      return lists.validateListExistsPromise({listKey: 'myList', familyId: 123})
        .then(result => {
          result.listExists.should.equal(true)
        })
    })

    it('should error if there no results', () => {
      const emptyArray = []
      const data = {listKey: 'myList', familyId: 123, someBaloney: 'sausages'}
      sinon.stub(listsMongoPromises, 'listsFindOnePromise').callsFake(() => {
        return Q.resolve(emptyArray)
      })
      return lists.validateListExistsPromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.notFound)
          result.listExists.should.equal(false)
          result.someBaloney.should.equal('sausages')
        })
    })

    it('should error if database errors', () => {
      const data = {listKey: 'myList', familyId: 123, someData: 'sausages'}
      sinon.stub(listsMongoPromises, 'listsFindOnePromise').callsFake(() => {
        return Q.reject('someError')
      })
      return lists.validateListExistsPromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
          result.someData.should.equal('sausages')
          should.not.exist(result.listExists)
        })
    })
  })
})
