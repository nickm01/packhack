/* eslint-env mocha */
// Above line makes it work with Mocha
const listItems = require('./listitems')
const listItemsPromises = require('./listitems.promises')
const should = require('chai').should()
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('./modelconstants')

describe('list items', () => {
  describe('when retrieving list items', () => {
    afterEach(() => {
      listItemsPromises.findPromise.restore()
    })

    it('should return multiple results', () => {
      const threeElementArray = [{}, {}, {}]
      sinon.stub(listItemsPromises, 'findPromise').callsFake(function () {
        return Q.resolve(threeElementArray)
      })
      return listItems.findPromise({listKey: 'myList', familyId: 123})
        .then(result => {
          result.listItems.length.should.equal(3)
        })
    })

    it('should return zero objects if no results', () => {
      const zeroElementArray = []
      sinon.stub(listItemsPromises, 'findPromise').callsFake(function () {
        return Q.resolve(zeroElementArray)
      })
      return listItems.findPromise({listKey: 'myList', familyId: 123})
        .then(result => {
          result.listItems.length.should.equal(0)
        })
    })

    it('should error if database errors', () => {
      sinon.stub(listItemsPromises, 'findPromise').callsFake(function () {
        return Q.reject('some error')
      })
      return listItems.findPromise({listKey: 'myList', familyId: 123, someData: 'sausages'})
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
          result.someData.should.equal('sausages')
          result.systemError.should.equal('some error')
          should.not.exist(result.listExists)
        })
    })
  })

  describe('when saving new list item', () => {
    afterEach(() => {
      listItemsPromises.saveNewPromise.restore()
    })

    it('should succeed for normal situation', () => {
      const data = {list: 'mylist', familyId: 123, listItemName: 'myItem'}
      sinon.stub(listItemsPromises, 'saveNewPromise').callsFake(() => {
        return Q.resolve(data)
      })
      return listItems.saveNewPromise(data)
        .then(result => {
          result.list.should.equal('mylist')
        }, () => {
          should.fail('not expecting error')
        })
    })

    it('should fail for error situation', () => {
      const data = {list: 'mylist', familyId: 123, listItemName: 'myItem'}
      sinon.stub(listItemsPromises, 'saveNewPromise').callsFake(() => {
        return Q.reject(data)
      })
      return listItems.saveNewPromise(data)
        .then(result => {
          should.fail('expecting error')
        }, result => {
          result.errorMessage.should.equal(modelConstants.errorTypes.generalError)
        })
    })
  })
})
