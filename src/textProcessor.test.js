/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const commandTypes = require('./commandtypes')

describe('textProcessor', () => {
  var languageProcessorMock, listsMock

  beforeEach(() => {
    languageProcessorMock = sinon.mock(languageProcessor)
    listsMock = sinon.mock(lists)
  })

  afterEach(() => {
    languageProcessorMock.restore()
    languageProcessorMock.verify()
    listsMock.restore()
    listsMock.verify()
  })

  describe('when "get list"', () => {
    const originalText = 'get list'
    const list = 'list'
    const data = {originalText, list}

    it('should call languageProcessor and then validate list', () => {
      languageProcessorMock.expects('processLanguagePromise').once().withArgs({originalText}).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.resolve(data))
      return textProcessor.processTextPromise({originalText})
    })
  })

  describe('when "get lists"', () => {
    const originalText = 'get lists'
    const data = {originalText}

    it('should not validate list', () => {
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').never()
      return textProcessor.processTextPromise(data)
    })
  })

  describe('when "create #MyList"', () => {
    const originalText = 'create #MyList'
    const command = commandTypes.createList
    const list = 'MyList'
    const data = {originalText, command, list}

    it('should resolve if list does not exist already', () => {
      const errorMessage = modelConstants.errorTypes.notFound
      const listExists = false
      const resultantData = {originalText, command, list, errorMessage, listExists}
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.reject(resultantData))
      return textProcessor.processTextPromise(data).then(result => {
        result.listExists.should.equal(false)
      }, errorResult => {
        should.fail('should not fail')
      })
    })

    it('should reject if list exists already', () => {
      const listExists = true
      const resultantData = {originalText, command, list, listExists}
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().returns(Q.resolve(resultantData))
      return textProcessor.processTextPromise(data).then(result => {
        should.fail('should fail')
      }, errorResult => {
        errorResult.listExists.should.equal(true)
        errorResult.errorMessage.should.equal(errors.errorTypes.listAlreadyExists)
      })
    })

    it('should reject if general error in list lookup', () => {
      const errorMessage = modelConstants.errorTypes.generalError
      const resultantData = {originalText, command, list, errorMessage}
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().returns(Q.reject(resultantData))
      return textProcessor.processTextPromise(data).then(result => {
        should.fail('should fail')
      }, errorResult => {
        should.not.exist(errorResult.listExists)
        errorResult.errorMessage.should.equal(errors.errorTypes.generalError)
      })
    })
  })

  describe('*** INTEGRATION TESTS', function () {
    describe('when "get list"', function () {
      var listsMock

      beforeEach(() => {
        listsMock = sinon.mock(lists)
      })

      afterEach(() => {
        listsMock.restore()
        listsMock.verify()
      })

      it('should be successful and pass data through', function () {
        var data = {
          originalText: 'get list',
          listExists: true,
          randomDataToCheckPassthrough: '123'
        }
        listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.resolve(data))
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

      it('should fail', function () {
        var data = {
          originalText: 'nonsense and nonsense',
          randomDataToCheckPassthrough: '123'
        }
        listsMock.expects('validateListExistsPromise').never()
        return textProcessor.processTextPromise(data).then(function (result) {
          should.fail('should error')
        }, (error) => {
          error.errorMessage.should.equal(errors.errorTypes.unrecognizedCommand)
          error.originalText.should.equal(data.originalText)
          error.words.length.should.equal(3)
          error.randomDataToCheckPassthrough.should.equal('123')
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

      it('should reject if list exists already', function () {
        var initialData = {
          originalText: 'create #thelist',
          randomDataToCheckPassthrough: '123'
        }
        sinon.stub(lists, 'validateListExistsPromise').callsFake(function (data) {
          data.listExists = true
          return Q.resolve(data)
        })
        return textProcessor.processTextPromise(initialData).then(function (result) {
          // Should error
          should.fail('should not error')
        }, (result) => {
          result.originalText.should.equal(initialData.originalText)
          result.listExists.should.equal(true)
          result.command.should.equal(commandTypes.createList)
          result.list.should.equal('thelist')
          should.not.exist(result.person)
          should.not.exist(result.supplementaryText)
          result.randomDataToCheckPassthrough.should.equal(initialData.randomDataToCheckPassthrough)
          result.words.length.should.equal(2)
          result.errorMessage.should.equal(errors.errorTypes.listAlreadyExists)
        })
      })
    })
  })
})
