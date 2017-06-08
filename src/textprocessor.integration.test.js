/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const lists = require('../model/lists')
const listItems = require('../model/listItems')
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const commandTypes = require('./commandtypes')

describe('textProcessor Integration', () => {
  var listsMock

  beforeEach(() => {
    listsMock = sinon.mock(lists)
  })

  afterEach(() => {
    listsMock.restore()
    listsMock.verify()
  })
  describe('when "get list" and list exists', function () {
    var listsMock
    var data

    beforeEach(() => {
      data = {
        originalText: 'get list',
        listExists: true,
        randomDataToCheckPassthrough: '123',
        listItems: []
      }
      listsMock = sinon.mock(lists)
      listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.resolve(data))
      sinon.stub(listItems, 'findPromise').callsFake(function (result) {
        return Q.resolve(result)
      })
    })

    afterEach(() => {
      listsMock.restore()
      listItems.findPromise.restore()
    })

    it('should be successful and pass data through', function () {
      return textProcessor.processTextPromise(data).then(function (result) {
        result.originalText.should.equal(data.originalText)
        result.listExists.should.be.true
        result.command.should.equal(commandTypes.getList)
        result.list.should.equal('list')
        should.not.exist(result.person)
        should.not.exist(result.supplementaryText)
        result.randomDataToCheckPassthrough.should.equal('123')
        result.words.length.should.equal(2)
      }, () => {
        should.fail('should not error')
      })
    })

    describe('and when list has 2 items', function () {
      beforeEach(() => {
        data.listItems = ['item1', 'item2']
      })

      it('should create responseText with 2 list items', function () {
        return textProcessor.processTextPromise(data).then(function (result) {
          result.responseText.should.equal('• item1\n• item2')
        })
      })
    })

    describe('and when list has 0 items', function () {
      beforeEach(() => {
        data.listItems = []
      })

      it('should create responseText with no items found', function () {
        return textProcessor.processTextPromise(data).then(function (result) {
          result.responseText.should.equal('Currently no items in #list.')
        })
      })
    })
  })

  describe('when "get list" and list does not exists', function () {
    var listsMock
    var data = {
      originalText: 'get list',
      listExists: false,
      randomDataToCheckPassthrough: '123',
      listItems: [],
      errorMessage: modelConstants.errorTypes.notFound
    }

    beforeEach(() => {
      listsMock = sinon.mock(lists)
      listsMock.expects('validateListExistsPromise').once().returns(Q.reject(data))
    })

    afterEach(() => {
      listsMock.restore()
    })

    it('should respond with appropriate error', function () {
      return textProcessor.processTextPromise(data).then(function (result) {
        result.responseText.should.equal('Sorry, couldn\'t find #list\nType "get lists" to see whats avauilable.')
      })
    })
  })

  describe('when "nonsense and nonsense"', function () {
    var listsMock

    beforeEach(() => {
      listsMock = sinon.mock(lists)
    })

    afterEach(() => {
      listsMock.restore()
      listsMock.verify()
    })

    it('should respond with don\'t understand', function () {
      var data = {
        originalText: 'nonsense and nonsense',
        randomDataToCheckPassthrough: '123'
      }
      listsMock.expects('validateListExistsPromise').never()
      return textProcessor.processTextPromise(data).then(function (result) {
        result.errorMessage.should.equal(errors.errorTypes.unrecognizedCommand)
        result.originalText.should.equal(data.originalText)
        result.words.length.should.equal(3)
        result.randomDataToCheckPassthrough.should.equal('123')
        result.responseText.should.equal('Sorry don\'t understand. Type \'packhack\' for help.')
      })
    })
  })

  describe('when "create #thelist"', function () {
    afterEach(() => {
      lists.validateListExistsPromise.restore()
    })

    it('should only succeed if list does not exist', function () {
      var initialData = {
        originalText: 'create #thelist',
        randomDataToCheckPassthrough: '123'
      }
      sinon.stub(lists, 'validateListExistsPromise').callsFake(function (data) {
        data.errorMessage = modelConstants.errorTypes.notFound
        data.listExists = false
        return Q.reject(data)
      })
      return textProcessor.processTextPromise(initialData).then(function (result) {
        result.originalText.should.equal(initialData.originalText)
        result.listExists.should.equal(false)
        result.command.should.equal(commandTypes.createList)
        result.list.should.equal('thelist')
        should.not.exist(result.person)
        should.not.exist(result.supplementaryText)
        result.randomDataToCheckPassthrough.should.equal(initialData.randomDataToCheckPassthrough)
        result.words.length.should.equal(2)
      }, () => {
        should.fail('should not error')
      })
    })

    // TODO: Fix this once we do create
    // it('should reject if list exists already', function () {
    //   var initialData = {
    //     originalText: 'create #thelist',
    //     randomDataToCheckPassthrough: '123'
    //   }
    //   sinon.stub(lists, 'validateListExistsPromise').callsFake(function (data) {
    //     data.listExists = true
    //     return Q.resolve(data)
    //   })
    //   return textProcessor.processTextPromise(initialData).then(function (result) {
    //     // Should error
    //     should.fail('should not error')
    //   }, (result) => {
    //     result.originalText.should.equal(initialData.originalText)
    //     result.listExists.should.equal(true)
    //     result.command.should.equal(commandTypes.createList)
    //     result.list.should.equal('thelist')
    //     should.not.exist(result.person)
    //     should.not.exist(result.supplementaryText)
    //     result.randomDataToCheckPassthrough.should.equal(initialData.randomDataToCheckPassthrough)
    //     result.words.length.should.equal(2)
    //     result.errorMessage.should.equal(errors.errorTypes.listAlreadyExists)
    //   })
    // })
  })
})