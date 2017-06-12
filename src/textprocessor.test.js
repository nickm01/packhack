/* eslint-env mocha */
// Above line makes it work with Mocha

// TODO: Remove

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
    listsMock.restore()
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
        result.listExists.should.equal(true)
        result.errorMessage.should.equal(errors.errorTypes.listAlreadyExists)
      }, errorResult => {
        should.fail('should not fail')
      })
    })

    it('should reject if general error in list lookup', () => {
      const errorMessage = modelConstants.errorTypes.generalError
      const resultantData = {originalText, command, list, errorMessage}
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().returns(Q.reject(resultantData))
      return textProcessor.processTextPromise(data).then(result => {
        should.not.exist(result.listExists)
        result.errorMessage.should.equal(errors.errorTypes.generalError)
      }, errorResult => {
        should.fail('should not fail')
      })
    })
  })
})
