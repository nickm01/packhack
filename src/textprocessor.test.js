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
      if (listItems.deletePromise.restore) {
        listItems.deletePromise.restore()
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

    // TODO: when deleting list, should really clear it too???
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

    describe('list item specific tests', () => {
      var listItemsMock

      beforeEach(() => {
        listItemsMock = sinon.mock(listItems)
      })

      afterEach(() => {
        listItemsMock.restore()
        listItemsMock.verify() // Use verify to confirm the sinon expects
      })

      describe('addListItem', () => {
        it('when "#mylist add bananas" and list exists and add succeeds', () => {
          data.originalText = '#myList add bananas'
          listExists()
          listItemsMock.expects('saveNewPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "#mylist add bananas" and list does not exist', () => {
          data.originalText = '#myList add bananas'
          listNotExists()
          return shouldRespondWith(phrases.listNotFound + 'mylist.\n' + phrases.suggestGetLists)
        })

        it('when "#mylist add bananas" and list exists and add fails', () => {
          data.originalText = '#myList add bananas'
          data.errorMessage = modelConstants.errorTypes.generalError
          listExists()
          listItemsMock.expects('saveNewPromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.generalError)
        })

        it('when "add bananas" and cachedListName and list exists', () => {
          data.originalText = 'add bananas'
          data.cachedListName = 'myList'
          listExists()
          listItemsMock.expects('saveNewPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "add bananas" and no cachedListName then error', () => {
          data.originalText = 'add bananas'
          listExists()
          listItemsMock.expects('saveNewPromise').never()
          return shouldRespondWith(phrases.noList + '\n' + phrases.addListItemExample)
        })

        it('when "add bananas to thisList" and list exists', () => {
          data.originalText = 'add bananas to thisList'
          data.cachedListName = 'thisList'
          listExists()
          listItemsMock.expects('saveNewPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "add bananas, coconuts, sausages" and cachedListName and list exists', () => {
          data.originalText = 'add bananas, coconuts, sausages'
          data.cachedListName = 'thisList'
          listExists()
          listItemsMock.expects('saveNewPromise').thrice().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "myList add" and no items specified and list exists', () => {
          data.originalText = 'myList add'
          listExists()
          listItemsMock.expects('saveNewPromise').never()
          return shouldRespondWith(phrases.noListItemToAdd + '\n' + phrases.addListItemExample)
        })

        it('when "add" and no cached list or items specified', () => {
          data.originalText = 'add'
          listItemsMock.expects('saveNewPromise').never()
          return shouldRespondWith(phrases.noListItemToAdd + '\n' + phrases.addListItemExample)
        })

        it('when "add ripe bananas  sausages, coconuts  and beer to thisList" and list exists', () => {
          data.originalText = 'add ripe bananas  sausages, coconuts  and beer to thisList'
          listExists()
          listItemsMock.expects('saveNewPromise').exactly(4).returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })
      })

      describe('removeListItem', () => {
        it('when "#mylist remove bananas" and list exists and remove succeeds', () => {
          data.originalText = '#myList remove bananas'
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "#mylist remove bananas, chocolate" and list exists and remove succeeds', () => {
          data.originalText = '#myList remove bananas, chocolate'
          listExists()
          listItemsMock.expects('deletePromise').twice().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "#mylist remove bananas" and list does not exists', () => {
          data.originalText = '#myList remove bananas'
          listNotExists()
          return shouldRespondWith(phrases.listNotFound + 'mylist.\n' + phrases.suggestGetLists)
        })

        it('when "#mylist remove bananas" and list exists and remove fails', () => {
          data.originalText = '#myList remove bananas'
          data.errorMessage = modelConstants.errorTypes.generalError
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.generalError)
        })

        it('when "remove bananas" and cachedListName and list exists and remove succeeds', () => {
          data.originalText = 'remove bananas'
          data.cachedListName = 'thisList'
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "remove bananas" and no cachedListName then error', () => {
          data.originalText = 'remove bananas'
          listExists()
          listItemsMock.expects('deletePromise').never()
          return shouldRespondWith(phrases.noList + '\n' + phrases.removeListItemExample)
        })

        it('when "#mylist remove bananas" and list exists and list item does not exist', () => {
          data.originalText = '#mylist remove bananas'
          listExists()
          data.errorMessage = modelConstants.errorTypes.listItemNotFound
          listItemsMock.expects('deletePromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.listItemNotFound +
            'bananas.\n' +
            phrases.suggestGetPartOne +
            'mylist' +
            phrases.suggestGetPartTwo)
        })

        it('when "#mylist remove bananas and coconuts" and coconuts do not exist', () => {
          data.originalText = '#mylist remove bananas and coconuts'
          listExists()
          listItemsMock.restore()
          sinon.stub(listItems, 'deletePromise').callsFake((result, listItemName) => {
            if (listItemName === 'bananas') {
              return Q.resolve(data)
            } else {
              data.errorMessage = modelConstants.errorTypes.listItemNotFound
              return Q.reject(data)
            }
          })
          return shouldRespondWith(phrases.listItemNotFound +
            'coconuts.\n' +
            phrases.suggestGetPartOne +
            'mylist' +
            phrases.suggestGetPartTwo)
        })

        it('when "#mylist remove bananas and coconuts" and bananas do not exist', () => {
          data.originalText = '#mylist remove bananas and coconuts'
          listExists()
          listItemsMock.restore()
          sinon.stub(listItems, 'deletePromise').callsFake((result, listItemName) => {
            if (listItemName === 'coconuts') {
              return Q.resolve(data)
            } else {
              data.errorMessage = modelConstants.errorTypes.listItemNotFound
              return Q.reject(data)
            }
          })
          return shouldRespondWith(phrases.listItemNotFound +
            'bananas.\n' +
            phrases.suggestGetPartOne +
            'mylist' +
            phrases.suggestGetPartTwo)
        })

        it('when "remove" and no cached list or items specified', () => {
          data.originalText = 'remove'
          listItemsMock.expects('deletePromise').never()
          return shouldRespondWith(phrases.noListItemToRemove + '\n' + phrases.removeListItemExample)
        })
      })
    })
  })
})
