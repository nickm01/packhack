/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const sinon = require('sinon')
const Q = require('q')

describe('textProcessor', function () {
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

  // TODO: Use sinon.test ????

  describe('when simple get list is called', function () {
    const originalText = 'get list'
    const data = {originalText}

    it('should call languageProcessor and then validate list', function () {
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.resolve(data))
      return textProcessor.processTextPromise(data)
    })
  })
})
