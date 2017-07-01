/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
// const commandTypes = require('./commandtypes')
const phrases = require('./phrases')

describe('textProcessor + languageProcessor', () => {
  describe('list specific tests', () => {
    var listsMock, data

    const item1 = {listItemName: 'item1'}
    const item2 = {listItemName: 'item2'}

    const listExists = () => {
      data.listExists = true
      listsMock.expects('validateListExistsPromise').once().returns(Q.resolve(data))
    }

    const listNotExists = () => {
      data.listExists = false
      data.errorMessage = modelConstants.errorTypes.listNotFound
      listsMock.expects('validateListExistsPromise').once().returns(Q.reject(data))
    }

    const listItemsExist = (items) => {
      data.listItems = items
      sinon.stub(listItems, 'findPromise').callsFake(result => {
        return Q.resolve(result)
      })
    }

    const shouldRespondWith = (output) => {
      return textProcessor.processTextPromise(data).then(result => {
        result.responseText.should.equal(output)
      }, () => {
        should.fail('should not error')
      })
    }

    beforeEach(() => {
      listsMock = sinon.mock(lists)
      data = {}
    })

    afterEach(() => {
      listsMock.restore()
      data = undefined
      if (listItems.findPromise.restore) {
        listItems.findPromise.restore()
      }
    })

    describe('getlist', () => {
      it('"get list" and list exists and 2 items', () => {
        data.originalText = 'get list'
        listExists()
        listItemsExist([item1, item2])
        return shouldRespondWith('• item1\n• item2')
      })

      it('"get #list" and list exists and 2 items', () => {
        data.originalText = 'get #list'
        listExists()
        listItemsExist([item1, item2])
        return shouldRespondWith('• item1\n• item2')
      })

      it('"#list" and list exists and 2 items', () => {
        data.originalText = 'get #list'
        listExists()
        listItemsExist([item1, item2])
        return shouldRespondWith('• item1\n• item2')
      })

      it('"get #list" and list exists and 0 items', () => {
        data.originalText = 'get #list'
        listExists()
        listItemsExist([])
        return shouldRespondWith('Currently no items in #list.')
      })

      it('"get #list" and list does not exist', () => {
        data.originalText = 'get #list'
        listNotExists()
        return shouldRespondWith(phrases.listNotFound + 'list.\n' + phrases.suggestGetLists)
      })

      it('"get list" with check for passthrough', () => {
        data.originalText = 'get list'
        listExists()
        listItemsExist([])
        data.someNonsense = 'nonsense'
        return textProcessor.processTextPromise(data).then(result => {
          result.someNonsense.should.equal('nonsense')
        })
      })

      it('"list" when list exists', () => {
        data.originalText = 'list'
        listExists()
        listItemsExist([{listItemName: 'bananas'}])
        return shouldRespondWith('• bananas')
      })

      it('"list" when list does not exists', () => {
        data.originalText = 'list'
        listNotExists()
        return shouldRespondWith(phrases.generalMisundertanding)
      })

      it('"get" when previously cached list', () => {
        data.originalText = 'get'
        data.cachedListName = 'list'
        listExists()
        listItemsExist([{listItemName: 'coconuts'}])
        return shouldRespondWith('• coconuts')
      })

      it('"get" when no cached list should result in an error', () => {
        data.originalText = 'get'
        return shouldRespondWith(phrases.noList + '\n' + phrases.getListExample)
      })
    })

    describe('"nonsense and nonsense"', () => {
      it('should respond with don\'t understand', () => {
        var listsMock = sinon.mock(lists)
        var data = {
          originalText: 'nonsense and nonsense',
          randomDataToCheckPassthrough: '123'
        }
        listsMock.expects('validateListExistsPromise').never()
        return textProcessor.processTextPromise(data).then(result => {
          result.errorMessage.should.equal(errors.errorTypes.unrecognizedCommand)
          result.originalText.should.equal(data.originalText)
          result.words.length.should.equal(3)
          result.randomDataToCheckPassthrough.should.equal('123')
          result.responseText.should.equal(phrases.generalMisundertanding)
          listsMock.restore()
        })
      })
    })

    describe('createList', () => {
      it('when "create mylist" and list does not exist and save succeeds', () => {
        data.originalText = 'create mylist'
        listNotExists()
        listsMock.expects('saveNewPromise').once().returns(Q.resolve(data))
        return shouldRespondWith(phrases.success)
      })

      it('when "create mylist" and mylist exists should error', () => {
        data.originalText = 'create mylist'
        listExists()
        return shouldRespondWith(phrases.listAlreadyExists)
      })

      it('when "create my list" should error - list has spaces', () => {
        data.originalText = 'create my list'
        return shouldRespondWith(phrases.listNameInvalid)
      })

      it('when "create create" should error - reserved word', () => {
        data.originalText = 'create #create'
        return shouldRespondWith(phrases.listNameInvalid)
      })

      it('when "create mylist" general error', () => {
        data.originalText = 'create myList'
        data.errorMessage = modelConstants.errorTypes.genealError
        listsMock.expects('validateListExistsPromise').once().returns(Q.reject(data))
        return shouldRespondWith(phrases.generalError)
      })

      it('when "create" with no cached list - no list error', () => {
        data.originalText = 'create'
        return shouldRespondWith(phrases.noList + '\n' + phrases.createListExample)
      })

      it('when "create" with cached list - no list error', () => {
        data.originalText = 'create'
        data.cachedListName = 'some-cached-list'
        return shouldRespondWith(phrases.noList + '\n' + phrases.createListExample)
      })
    })

    describe('deleteList', () => {
      it('when "delete mylist" and list exists and delete succeeds', () => {
        data.originalText = 'delete mylist'
        listExists()
        listsMock.expects('deletePromise').once().returns(Q.resolve(data))
        return shouldRespondWith(phrases.success)
      })

      it('when "delete mylist" and list exists and delete fails', () => {
        data.originalText = 'delete mylist'
        data.errorMessage = modelConstants.errorTypes.generalError
        listExists()
        listsMock.expects('deletePromise').once().returns(Q.reject(data))
        return shouldRespondWith(phrases.generalError)
      })

      it('when "delete mylist" and list does not exist', () => {
        data.originalText = 'delete mylist'
        listNotExists()
        return shouldRespondWith(phrases.listNotFound + 'mylist.\n' + phrases.suggestGetLists)
      })

      it('when "delete" and no cache', () => {
        data.originalText = 'delete'
        return shouldRespondWith(phrases.noList + '\n' + phrases.deleteListExample)
      })

      it('when "delete" and with cache should ignore cache', () => {
        data.originalText = 'delete'
        data.cachedListName = 'mylist'
        return shouldRespondWith(phrases.noList + '\n' + phrases.deleteListExample)
      })
    })
  })
})
