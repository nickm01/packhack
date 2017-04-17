/* eslint-env mocha */
// Above line makes it work with Mocha

const resolved = require('path').resolve('./model/mongo.js')
// require.cache[resolved] = {
//   id: resolved,
//   filename: resolved,
//   loaded: true,
//   exports: function () {
//     console.log('------>>>>>>>>>   hi there!')
//   }
// }
console.log('$$$: ' + resolved)

const lists = require('./lists')
const listsMongoPromises = require('./listsmongopromises')
const should = require('chai').should()
const sinon = require('sinon')
const Q = require('q')

describe('lists', function () {
  // var findOneListMock

  beforeEach(() => {
    // findOneListMock = sinon.mock(listsMongoPromises)
  })

  afterEach(() => {
    // if (findOneListMock) {
    //   findOneListMock.restore()
    //   findOneListMock.verify()
    // }
  })

  // TODO: Use sinon.test ????
  describe('lists document access', function () {
    it('returns 1 result', function () {
      sinon.stub(listsMongoPromises, 'listsFindOnePromise').callsFake(function () {
        return Q.resolve({
          'listKey': 'myList',
          'listDescription': 'line',
          'familyId': 123
        })
      })
      // findOneListMock.expects('listsFindOnePromise').withArgs({}).returns(Q.resolve([{}]))
      return lists.validateListExistsPromise({listKey: 'myList', familyId: 123})
        .then(function (result) {
          result.should.equal(true)
        }, function (error) {
          should.fail('should not have failed: ' + error)
        })
    })
  })
})
