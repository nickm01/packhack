/* eslint-env mocha */
// Above line makes it work with Mocha
const lists = require('./lists')
const listsPromises = require('./lists.promises')
const should = require('chai').should()
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('./modelconstants')

describe('lists', () => {
  describe('when validating list exists', () => {
    afterEach(() => {
      listsPromises.findOnePromise.restore()
    })

    it('should find if there is one result', () => {
      const singleElementArray = [{}]
      sinon.stub(listsPromises, 'findOnePromise').callsFake(() => {
        return Q.resolve(singleElementArray)
      })
      return lists.validateListExistsPromise({list: 'myList', familyId: 123})
        .then(result => {
          result.listExists.should.equal(true)
        })
    })

    it('should error if there no results', () => {
      const data = {list: 'myList', familyId: 123, someBaloney: 'sausages'}
      sinon.stub(listsPromises, 'findOnePromise').callsFake(() => {
        return Q.resolve(null)
      })
      return lists.validateListExistsPromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.listNotFound)
          result.listExists.should.equal(false)
          result.someBaloney.should.equal('sausages')
        })
    })

    it('should error if database errors', () => {
      const data = {list: 'myList', familyId: 123, someData: 'sausages'}
      sinon.stub(listsPromises, 'findOnePromise').callsFake(() => {
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

  describe('when retrieving all lists', () => {
    afterEach(() => {
      listsPromises.findAllPromise.restore()
    })

    it('should return multiple lists when multiple exist', () => {
      const data = {familyId: 123, someBaloney: 'sausages'}
      sinon.stub(listsPromises, 'findAllPromise').callsFake(function () {
        return Q.resolve(['a', 'b', 'c'])
      })
      return lists.findAllPromise(data)
        .then(result => {
          data.lists.length.should.equal(3)
        }, result => {
          should.fail('not expecting error')
        })
    })
  })

  describe('when saving new list', () => {
    afterEach(() => {
      listsPromises.saveNewPromise.restore()
    })

    it('should succeed for normal situation', () => {
      const data = {list: 'mylist', familyId: 123}
      const returnData = {listKey: 'mylist', familyId: 123, listDescription: 'mylist'}
      sinon.stub(listsPromises, 'saveNewPromise').callsFake(() => {
        return Q.resolve(returnData)
      })
      return lists.saveNewPromise(data)
        .then(result => {
          result.list.should.equal('mylist')
        }, () => {
          should.fail('not expecting error')
        })
    })

    it('should fail for error situation', () => {
      const data = {list: 'mylist', familyId: 123}
      const returnData = {listKey: 'mylist', familyId: 123, listDescription: 'mylist'}
      sinon.stub(listsPromises, 'saveNewPromise').callsFake(() => {
        return Q.reject(returnData)
      })
      return lists.saveNewPromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
          should.not.exist(result.listDescription)
        })
    })

    it('should lowercase list when mixed case and use mixed case for list description', () => {
      const data = {list: 'myCapitalizedList', familyId: 123}
      const returnData = {listKey: 'mycapitalizedlist', familyId: 123, listDescription: 'myCapitalizedList'}
      sinon.stub(listsPromises, 'saveNewPromise').callsFake((list, familyId, listDescription) => {
        list.should.equal('mycapitalizedlist')
        listDescription.should.equal('myCapitalizedList')
        return Q.resolve(returnData)
      })
      return lists.saveNewPromise(data)
        .then(result => {
          result.list.should.equal('mycapitalizedlist')
          result.listDescription.should.equal('myCapitalizedList')
        }, () => {
          should.fail('not expecting error')
        })
    })
  })

  describe('when deleting list', () => {
    afterEach(() => {
      listsPromises.deletePromise.restore()
    })

    it('should succeed for normal situation', () => {
      const data = {list: 'mylist', familyId: 123}
      sinon.stub(listsPromises, 'deletePromise').callsFake(() => {
        return Q.resolve(data)
      })
      return lists.deletePromise(data)
        .then(result => {
          result.list.should.equal('mylist')
        }, () => {
          should.fail('not expecting error')
        })
    })

    it('should fail for error situation', () => {
      const data = {list: 'mylist', familyId: 123}
      sinon.stub(listsPromises, 'deletePromise').callsFake(() => {
        return Q.reject(null)
      })
      return lists.deletePromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
        })
    })

    it('should fail for zero results', () => {
      const data = {list: 'mylist', familyId: 123, result: {n: 0}}
      sinon.stub(listsPromises, 'deletePromise').callsFake(() => {
        return Q.resolve(data)
      })
      return lists.deletePromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.listNotFound )
        })
    })
  })
})
