/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const languageProcessor = require('./languageprocessor')
const lists = require('../model/lists')
const sinon = require('sinon')
const Q = require('q')

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

  // TODO: Use sinon.test ????

  describe('when simple get list is called', () => {
    const originalText = 'get list'
    const data = {originalText}

    it('should call languageProcessor and then validate list', () => {
      languageProcessorMock.expects('processLanguagePromise').once().withArgs(data).returns(Q.resolve(data))
      listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.resolve(data))
      return textProcessor.processTextPromise(data)
    })
  })

  describe('integration tests', function () {
    describe('when text is "get list"', function () {
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
          result.command.should.equal(languageProcessor.commandTypes.getList)
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

    describe('when text is "nonsense and nonsense"', function () {
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
          console.log(JSON.stringify(error, null, 3))
          error.message.should.equal(languageProcessor.errorTypes.unrecognizedCommand)
          error.originalText.should.equal(data.originalText)
          error.words.length.should.equal(3)
          error.randomDataToCheckPassthrough.should.equal('123')
        })
      })
    })

    describe('when text is "yaddayadda"', function () {
      var listsMock

      beforeEach(() => {
        listsMock = sinon.mock(lists)
      })

      afterEach(() => {
        listsMock.restore()
        listsMock.verify()
      })

      // TODO: Here's the conundrum!!!... needs to call validateListExist??? Maybe don't throw in language processor
      // TODO: Change from message to error ???
      describe('and is not a valid list', () => {
        it('should error', function () {
          var data = {
            originalText: 'yaddayadda',
            randomDataToCheckPassthrough: '123'
          }
          listsMock.expects('validateListExistsPromise').never()
          listsMock.expects('validateListExistsPromise').once().withArgs(data).returns(Q.reject(data))
          return textProcessor.processTextPromise(data).then(function (result) {
            should.fail('should error')
          }, (error) => {
            error.message.should.equal(languageProcessor.errorTypes.unrecognizedCommandCouldBeList)
            error.originalText.should.equal(data.originalText)
            error.words.length.should.equal(1)
            error.randomDataToCheckPassthrough.should.equal('123')
          })
        })
      })
    })
  })
})
