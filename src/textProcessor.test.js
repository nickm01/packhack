/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const languageProcessor = require('./languageprocessor')
const sinon = require('sinon')

describe('textProcessor', function () {
  var languageProcessorMock

  beforeEach(() => {
    languageProcessorMock = sinon.mock(languageProcessor)
  })

  afterEach(() => {
    if (languageProcessorMock) {
      languageProcessorMock.restore()
      languageProcessorMock.verify()
    }
  })

  // TODO: Use sinon.test ????
  describe('basics', function () {
    it('calls languageProcessor with relevant args', function () {
      languageProcessorMock.expects('processLanguage').once().withArgs('get list', null)
      textProcessor.processText('get list', null)
    })
    it('checks list name to see if it already exists', function () {
      const languageProcessorResult = {
        command: languageProcessor.commandTypes.getList,
        list: 'testList'
      }
      languageProcessorMock.expects('processLanguage').once().returns(languageProcessorResult)
      textProcessor.processText('get list', null)
    })
  })
})
