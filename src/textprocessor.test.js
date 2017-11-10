/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textprocessor')
const smsProcessor = require('./smsprocessor')
const lists = require('../model/lists')
const listItems = require('../model/listitems')
const familyMembers = require('../model/familymembers')
const sinon = require('sinon')
const Q = require('q')
const modelConstants = require('../model/modelconstants')
const errors = require('./errors')
const phrases = require('./phrases')
const logger = require('winston')

describe('textProcessor + languageProcessor', () => {
  var data, familyMemberMock

  beforeEach(() => {
    data = {}
    familyMemberMock = sinon.mock(familyMembers)
    familyMemberMock.expects('retrievePersonFromPhoneNumberPromise').once().callsFake(result => {
      logger.log('debug', '___retrievePersonFromPhoneNumberPromiseMock')
      return Q.resolve(result)
    })
  })

  afterEach(() => {
    data = undefined
    familyMemberMock.restore()
    familyMemberMock.verify() // Use verify to confirm the sinon expects
  })

  const shouldRespondWith = expected => {
    return textProcessor.processTextPromise(data).then(result => {
      const expectedDynamic =
        expected
          .replace('%#list', '#' + data.list)
          .replace('%@person', '@' + data.person)
          .replace('%%date', data.reminderUserDateText)
          .replace('%%commandSpecificSuggestion', phrases[data.command + 'Example'])
      result.responseText.should.equal(expectedDynamic)
    }, () => {
      should.fail('should not error')
    })
  }

  describe('list specific tests', () => {
    var listsMock

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

    beforeEach(() => {
      listsMock = sinon.mock(lists)
    })

    afterEach(() => {
      listsMock.restore()
      listsMock.verify()
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

      it('"get #list" and list exists and 0 items', () => {
        data.originalText = 'get #list'
        listExists()
        listItemsExist([])
        return shouldRespondWith(phrases.noItems)
      })

      it('"get #list" and list does not exist', () => {
        data.originalText = 'get #list'
        listNotExists()
        return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
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
        return shouldRespondWith(phrases.noList)
      })
    })

    describe('editlist', () => {
      it('"edit list" and list exists and 2 items', () => {
        data.originalText = 'edit list'
        listExists()
        listItemsExist([item1, item2])
        return shouldRespondWith('1. item1\n2. item2\n' + phrases.editListRemoveSuggestion)
      })

      it('"edit #list" and list exists and 0 items', () => {
        data.originalText = 'edit #list'
        listExists()
        listItemsExist([])
        return shouldRespondWith(phrases.noItems)
      })

      it('"edit #list" and list does not exist', () => {
        data.originalText = 'edit #list'
        listNotExists()
        return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
      })

      it('"change" when previously cached list', () => {
        data.originalText = 'change'
        data.cachedListName = 'list'
        listExists()
        listItemsExist([{listItemName: 'coconuts'}])
        return shouldRespondWith('1. coconuts\n' + phrases.editListRemoveSuggestion)
      })

      it('"edit" when no cached list should result in an error', () => {
        data.originalText = 'edit'
        return shouldRespondWith(phrases.noList)
      })
    })

    describe('"nonsense and nonsense"', () => {
      it('should respond with don\'t understand', () => {
        var listsMock = sinon.mock(lists)
        data = {
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

      // TODO: Should include lists and get as a reserved word

      it('when "create mylist" general error', () => {
        data.originalText = 'create myList'
        data.errorMessage = modelConstants.errorTypes.genealError
        listsMock.expects('validateListExistsPromise').once().returns(Q.reject(data))
        return shouldRespondWith(phrases.generalError)
      })

      it('when "create" with no cached list - no list error', () => {
        data.originalText = 'create'
        return shouldRespondWith(phrases.noList)
      })

      it('when "create" with cached list - no list error', () => {
        data.originalText = 'create'
        data.cachedListName = 'some-cached-list'
        return shouldRespondWith(phrases.noList)
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

      it('when "delete list" and list does not exist', () => {
        data.originalText = 'delete list'
        listNotExists()
        return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
      })

      it('when "delete" and no cache', () => {
        data.originalText = 'delete'
        return shouldRespondWith(phrases.noList)
      })

      it('when "delete" and with cache should ignore cache', () => {
        data.originalText = 'delete'
        data.cachedListName = 'mylist'
        return shouldRespondWith(phrases.noList)
      })
    })

    describe('getLists', () => {
      it('when "get lists" and lists exist', () => {
        data.originalText = 'get lists'
        data.lists = [{listKey: 'one'}, {listKey: 'two'}]
        listsMock.expects('findAllPromise').once().returns(Q.resolve(data))
        return shouldRespondWith('#one\n#two')
      })

      it('when "lists" and single list exist', () => {
        data.originalText = 'lists'
        data.lists = [{listKey: 'one'}]
        listsMock.expects('findAllPromise').once().returns(Q.resolve(data))
        return shouldRespondWith('#one')
      })

      it('when "get lists" but no lists', () => {
        data.originalText = 'get lists'
        data.lists = []
        logger.log('debug', 'xxx:' + data.lists.length)
        listsMock.expects('findAllPromise').once().returns(Q.resolve(data))
        return shouldRespondWith(phrases.noListsExist + '\n' + phrases.createListExample)
      })

      it('when "get lists" and general error', () => {
        data.originalText = 'get lists'
        data.errorMessage = modelConstants.errorTypes.generalError
        listsMock.expects('findAllPromise').once().returns(Q.reject(data))
        return shouldRespondWith(phrases.generalError)
      })

      // TODO: "get" with no cache should actually be get lists
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
          return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
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
          listItemsMock.expects('saveNewPromise').never()
          return shouldRespondWith(phrases.noList)
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

        it('when "add ripe bananas  sausages  coconuts  beer to thisList" and list exists', () => {
          data.originalText = 'add ripe bananas  sausages  coconuts  beer to thisList'
          listExists()
          listItemsMock.expects('saveNewPromise').exactly(4).returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "add sausages\ncoconuts\nbeer" and list exists', () => {
          data.originalText = 'add sausages\ncoconuts\nbeer'
          data.cachedListName = 'theList'
          listExists()
          listItemsMock.expects('saveNewPromise').exactly(3).returns(Q.resolve(data))
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
          return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
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
          listItemsMock.expects('deletePromise').never()
          return shouldRespondWith(phrases.noList)
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
          listItemsMock.expects('deletePromise').twice().callsFake((result, listItemName) => {
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
          listItemsMock.expects('deletePromise').twice().callsFake((result, listItemName) => {
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

        it('when "#mylist remove 1, 2" and list exists and remove succeeds', () => {
          data.originalText = '#myList remove 1, 2'
          data.listItems = [item1, item2]
          listExists()
          listItemsMock.expects('findPromise').once().returns(Q.resolve(data))
          let countItem = 0
          listItemsMock.expects('deletePromise').twice().callsFake((data, listItemName) => {
            listItemName.should.equal(data.listItems[countItem].listItemName)
            countItem++
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success)
        })

        it('when "#mylist remove 1, 10" and list exists but 10 does not exist', () => {
          data.originalText = '#myList remove 1, 10'
          data.listItems = [item1, item2]
          listExists()
          listItemsMock.expects('findPromise').once().returns(Q.resolve(data))
          let countItem = 0
          listItemsMock.expects('deletePromise').twice().callsFake((result, listItemName) => {
            countItem++
            if (countItem === 1) {
              listItemName.should.equal(item1.listItemName)
              return Q.resolve(data)
            } else {
              listItemName.should.equal('10')
              data.errorMessage = modelConstants.errorTypes.listItemNotFound
              return Q.reject(data)
            }
          })
          return shouldRespondWith(phrases.listItemIndexNotFound +
            '10.\n' +
            phrases.suggestEditPartOne +
            'mylist' +
            phrases.suggestEditPartTwo)
        })
      })

      describe('clearList', () => {
        it('when "clear #mylist" and list exists and succeeds', () => {
          data.originalText = 'clear #myList'
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "clear #mylist" and list does not exist', () => {
          data.originalText = 'clear #myList'
          listNotExists()
          return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
        })

        it('when "clear #mylist" and list exists and failure', () => {
          data.originalText = 'clear #myList'
          data.errorMessage = modelConstants.errorTypes.generalError
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.generalError)
        })

        it('when "clear #mylist" and list already clear', () => {
          data.originalText = 'clear #myList'
          data.errorMessage = modelConstants.errorTypes.listItemNotFound
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.listAlreadyClear)
        })

        it('when "clear" and cachedListName exists', () => {
          data.originalText = 'clear'
          data.cachedListName = 'mylist'
          listExists()
          listItemsMock.expects('deletePromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.success)
        })

        it('when "clear" and no cachedListName exists', () => {
          data.originalText = 'clear'
          return shouldRespondWith(phrases.noList)
        })
      })
    })

    describe('family member specific tests', () => {
      var sendSmsPromiseStub, listItemsMock

      beforeEach(() => {
        listItemsMock = sinon.mock(listItems)
      })

      afterEach(() => {
        listItemsMock.restore()
        listItemsMock.verify() // Use verify to confirm the sinon expects
        if (sendSmsPromiseStub) {
          sendSmsPromiseStub.restore()
        }
      })

      describe('sendList', () => {
        it('when "send @someone #list" and person exist and list exists and 2 items then sms and success', () => {
          data.originalText = 'send @someone #list'
          data.phoneNumbers = ['111']
          data.fromPerson = 'nick'
          listExists()
          listItemsExist([item1, item2])
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            to.should.equal('111')
            message.should.equal('@nick just sent you #list:\n• item1\n• item2')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "send @someone #list" and person exist and list exists and 0 items then sms and success', () => {
          data.originalText = 'send @someone #list'
          data.phoneNumbers = ['111']
          data.fromPerson = 'nick'
          listExists()
          listItemsExist([])
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            to.should.equal('111')
            message.should.equal('@nick just sent you #list:\nCurrently no items in #list.')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "send @someone #list" and person does not exist and list exists then person failure', () => {
          data.originalText = 'send @someone #list'
          data.errorMessage = modelConstants.errorTypes.personNotFound
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.personNotFound)
        })

        it('when "send @someone #list" and person exists and list does not exist then list failure', () => {
          data.originalText = 'send @someone #list'
          data.errorMessage = modelConstants.errorTypes.personNotFound
          listNotExists()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.listNotFound + '\n' + phrases.suggestGetLists)
        })

        it('when "send @someone #list" and person does not exist and list does not exist then person failure', () => {
          data.originalText = 'send @someone #list'
          data.errorMessage = modelConstants.errorTypes.personNotFound
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.reject(data))
          return shouldRespondWith(phrases.personNotFound)
        })

        // TODO: FROM HERE XXX
        it('when "send @all #list" then multiple sms and success', () => {
          data.originalText = 'send @all #list'
          data.phoneNumbers = ['111', '222', '333', '444']
          data.fromPerson = 'nick'
          data.fromPhoneNumber = '222'
          listExists()
          listItemsExist([item1, item2])
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          var callCount = 0
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            to.should.equal(['111', '333', '444'][callCount])
            callCount++
            message.should.equal('@nick just sent you #list:\n• item1\n• item2')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledThrice(sendSmsPromiseStub)
          })
        })

        it('when "send @someone #list" and sms failure', () => {
          data.originalText = 'send @someone #list'
          data.phoneNumbers = ['111']
          data.fromPerson = 'nick'
          listExists()
          listItemsExist([item1])
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            data.errorMessage = errors.errorTypes.smsError
            return Q.reject(data)
          })
          return shouldRespondWith(phrases.smsError).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "send @myself #list" should still send it', () => {
          data.originalText = 'send @myself #list'
          data.phoneNumbers = ['111']
          data.fromPerson = 'myself'
          data.fromPhoneNumber = '111'
          listExists()
          listItemsExist([item1, item2])
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            to.should.equal('111')
            message.should.equal('@myself just sent you #list:\n• item1\n• item2')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "send @someone" and no list', () => {
          data.originalText = 'send @someone'
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').never()
          return shouldRespondWith(phrases.noList)
        })
      })

      describe('addReminder', () => {
        var
          validateListExistsPromiseStub,
          listItemsSaveNewReminderPromiseStub,
          listSaveNewPromiseStub,
          clock

        beforeEach(() => {
          const now = new Date('01/01/2017 09:00:00 GMT-0500')
          clock = sinon.useFakeTimers(now.getTime())
          data.fromPerson = 'nick'
          data.timezone = 'America/New_York'
          data.phoneNumbers = ['111']
          data.now = new Date()
        })

        afterEach(() => {
          if (validateListExistsPromiseStub) {
            validateListExistsPromiseStub.restore()
          }
          if (listItemsSaveNewReminderPromiseStub) {
            listItemsSaveNewReminderPromiseStub.restore()
          }
          if (listSaveNewPromiseStub) {
            listSaveNewPromiseStub.restore()
          }
          clock.restore()
        })

        it('when "remind @someone #list tomorrow go shopping" and all exists then add listItem and success', () => {
          data.originalText = 'remind @someone #my-list tomorrow go shopping'

          // Manually stub out lists
          listsMock.restore()
          data.listExists = true
          validateListExistsPromiseStub = sinon.stub(lists, 'validateListExistsPromise').callsFake((data) => {
            // Checks event list which is only set before the second call
            logger.log('debug', '___validateListExistsPromiseStub')
            if (!data.reminderList) {
              data.list.should.equal('my-list')
            } else {
              data.list.should.equal('reminders')
            }
            return Q.resolve(data)
          })

          // Manually stub out listItems
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@someone: #my-list go shopping - Monday, Jan 2nd')
            data.reminderTitle.should.equal('go shopping')
            data.reminderWhenGMT.toString().should.equal('Mon Jan 02 2017 05:00:00 GMT+0000 (GMT)')
            data.list.should.equal('reminders')
            data.person.should.equal('someone')
            data.reminderList.should.equal('my-list')
            return Q.resolve(data)
          })

          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledTwice(validateListExistsPromiseStub)
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })

        it('when "remind @someone today shopping" and reminders list not yet created then should create', () => {
          data.originalText = 'remind @someone tomorrow go shopping'

          // Manually stub out lists - validateListExistsPromise
          listsMock.restore()

          // validate should fail
          data.listExists = false
          data.errorMessage = modelConstants.errorTypes.listNotFound
          validateListExistsPromiseStub = sinon.stub(lists, 'validateListExistsPromise').callsFake((data) => {
            logger.log('debug', '___validateListExistsPromiseStub')
            return Q.reject(data)
          })

          // should create new list called reminders
          listSaveNewPromiseStub = sinon.stub(lists, 'saveNewPromise').callsFake((data) => {
            logger.log('debug', '___listSaveNewPromiseStub')
            data.list.should.equal('reminders')
            return Q.resolve(data)
          })

          // Manually stub out listItems
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@someone: go shopping - Monday, Jan 2nd')
            return Q.resolve(data)
          })

          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledOnce(validateListExistsPromiseStub)
            sinon.assert.calledOnce(listSaveNewPromiseStub)
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })
        it('when "remind @all tomorrow go shopping', () => {
          data.originalText = 'remind @all tomorrow go shopping'
          listExists()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))

          // listItems - manual stub
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@all: go shopping - Monday, Jan 2nd')
            return Q.resolve(data)
          })

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledOnce(listSaveNewPromiseStub)
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })

        it('when "remind @me tomorrow go shopping', () => {
          data.originalText = 'remind @me tomorrow go shopping'
          data.fromPerson = 'nick'
          listExists()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').never()

          // listItems - manual stub
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@nick: go shopping - Monday, Jan 2nd')
            return Q.resolve(data)
          })

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })

        it('when "remind @me to shop tomorrow', () => {
          data.originalText = 'remind @me to shop tomorrow'
          data.fromPerson = 'nick'
          listExists()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').never()

          // listItems - manual stub
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@nick: shop - Monday, Jan 2nd')
            return Q.resolve(data)
          })

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })

        it('when "remind @me tomorrow noon to shop', () => {
          data.originalText = 'remind @me tomorrow noon to shop'
          data.fromPerson = 'nick'
          listExists()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').never()

          // listItems - manual stub
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@nick: shop - Monday 12pm, Jan 2nd')
            return Q.resolve(data)
          })

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })

        it('when "remind @someone yesterday go shopping" and error due to past', () => {
          data.originalText = 'remind @someone yesterday go shopping'
          listItemsMock.expects('saveNewReminderPromise').never()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.dateTimePast)
        })

        it('when "remind @someone today 8:59am go shopping" and error due to past', () => {
          data.originalText = 'remind @someone today 8:59am go shopping'
          listItemsMock.expects('saveNewReminderPromise').never()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.dateTimePast)
        })

        it('when "remind @someone now go shopping" and should not error', () => {
          data.originalText = 'remind @someone now go shopping'
          listExists()

          // Manually stub out listItems
          listItemsMock.restore()
          listItemsSaveNewReminderPromiseStub = sinon.stub(listItems, 'saveNewReminderPromise').callsFake((data) => {
            logger.log('debug', '___listItemsSaveNewReminderPromiseStub')
            data.listItemName.should.equal('@someone: go shopping - Sunday 9am, Jan 1st')
            data.reminderTitle.should.equal('go shopping')
            data.reminderWhenGMT.toString().should.equal('Sun Jan 01 2017 14:00:00 GMT+0000 (GMT)')
            data.list.should.equal('reminders')
            data.person.should.equal('someone')
            should.not.exist(data.reminderList)
            return Q.resolve(data)
          })

          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))

          return shouldRespondWith(phrases.addReminderSuccess).then(data => {
            sinon.assert.calledOnce(listItemsSaveNewReminderPromiseStub)
          })
        })

        it('when "remind @someone tomorrow" and no title', () => {
          data.originalText = 'remind @someone tomorrow'
          listItemsMock.expects('saveNewReminderPromise').never()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.noTitle)
        })

        it('when "remind @someone go shopping" and no datetime', () => {
          data.originalText = 'remind @someone go shopping'
          listItemsMock.expects('saveNewReminderPromise').never()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.noDateTime)
        })

        it('when "remind @someone" and no title and no datetime', () => {
          data.originalText = 'remind @someone'
          listItemsMock.expects('saveNewReminderPromise').never()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().returns(Q.resolve(data))
          return shouldRespondWith(phrases.noDateTime)
        })

        it('when "remind" and no person and no title and no datetime', () => {
          data.originalText = 'remind'
          listItemsMock.expects('saveNewReminderPromise').never()
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').never()
          return shouldRespondWith(phrases.noPerson)
        })
      })

      describe('pushIntro', () => {
        it('when "**welcome @someone 2" then show welcome text sms', () => {
          data.originalText = '**welcome @someone 2'
          data.phoneNumbers = ['111']
          data.familyId = 1
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().callsFake((result) => {
            logger.log('debug', '___retrievePersonPhoneNumbersPromiseMock')
            result.familyId.should.equal(2)
            result.person.should.equal('someone')
            return Q.resolve(data)
          })
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            logger.log('debug', '___sendSmsPromiseStub')
            to.should.equal('111')
            message.should.equal(phrases.pushIntro)
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "**welcome @all 2" then send welcome text to all', () => {
          data.originalText = '**welcome @all 2'
          data.phoneNumbers = ['111', '222']
          data.familyId = 1
          var callCount = 0
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().callsFake((result) => {
            logger.log('debug', '___retrievePersonPhoneNumbersPromiseMock')
            result.familyId.should.equal(2)
            result.person.should.equal('all')
            return Q.resolve(data)
          })
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            logger.log('debug', '___sendSmsPromiseStub')
            callCount++
            if (callCount === 1) {
              to.should.equal('111')
            } else {
              to.should.equal('222')
            }
            message.should.equal(phrases.pushIntro)
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledTwice(sendSmsPromiseStub)
          })
        })

        it('when "**welcome" then should respond with error', () => {
          data.originalText = '**welcome'
          return shouldRespondWith(phrases.noPerson)
        })
      })

      describe('adminSend', () => {
        it('when "**push @someone 2 welcome you!" then show welcome text sms', () => {
          data.originalText = '**push @someone 2 welcome you!'
          data.bodyTextCased = '**push @someone 2 welcome you!'
          data.phoneNumbers = ['111']
          data.familyId = 1
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().callsFake((result) => {
            logger.log('debug', '___retrievePersonPhoneNumbersPromiseMock')
            result.familyId.should.equal(2)
            result.person.should.equal('someone')
            return Q.resolve(data)
          })
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            logger.log('debug', '___sendSmsPromiseStub')
            to.should.equal('111')
            message.should.equal('welcome you!')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "**push @someone 2 Welcome**YOU!" then show welcome text sms', () => {
          data.originalText = '**push @someone 2 welcome@@you!'
          data.bodyTextCased = '**push @someone 2 Welcome@@YOU!'
          data.phoneNumbers = ['111']
          data.familyId = 1
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().callsFake((result) => {
            logger.log('debug', '___retrievePersonPhoneNumbersPromiseMock')
            result.familyId.should.equal(2)
            result.person.should.equal('someone')
            return Q.resolve(data)
          })
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            logger.log('debug', '___sendSmsPromiseStub')
            to.should.equal('111')
            message.should.equal('Welcome\nYOU!')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledOnce(sendSmsPromiseStub)
          })
        })

        it('when "**push @all 2 hello" then send welcome text to all', () => {
          data.originalText = '**push @all 2 hello'
          data.bodyTextCased = '**push @all 2 hello'
          data.phoneNumbers = ['111', '222']
          data.familyId = 1
          var callCount = 0
          familyMemberMock.expects('retrievePersonPhoneNumbersPromise').once().callsFake((result) => {
            logger.log('debug', '___retrievePersonPhoneNumbersPromiseMock')
            result.familyId.should.equal(2)
            result.person.should.equal('all')
            return Q.resolve(data)
          })
          sendSmsPromiseStub = sinon.stub(smsProcessor, 'sendSmsPromise').callsFake((data, to, message) => {
            logger.log('debug', '___sendSmsPromiseStub')
            callCount++
            if (callCount === 1) {
              to.should.equal('111')
            } else {
              to.should.equal('222')
            }
            message.should.equal('hello')
            return Q.resolve(data)
          })
          return shouldRespondWith(phrases.success).then(data => {
            sinon.assert.calledTwice(sendSmsPromiseStub)
          })
        })

        it('when "**push" then should respond with error', () => {
          data.originalText = '**push'
          return shouldRespondWith(phrases.generalError)
        })
      })
    })
  })

  describe('help', () => {
    it('when "packhack" then show help text', () => {
      data.originalText = 'packhack'
      return shouldRespondWith(phrases.help)
    })

    it('when "hack" then show help text', () => {
      data.originalText = 'hack'
      return shouldRespondWith(phrases.help)
    })
  })

  describe('initial from phone number validation', () => {
    it('phone number not found', () => {
      data.originalText = 'blablabla'
      familyMemberMock.restore()
      familyMemberMock = sinon.mock(familyMembers)
      familyMemberMock.expects('retrievePersonFromPhoneNumberPromise').once().callsFake((result) => {
        logger.log('debug', '___retrievePersonFromPhoneNumberPromiseMock_updated')
        result.errorMessage = modelConstants.errorTypes.personNotFound
        return Q.reject(data)
      })
      return shouldRespondWith(phrases.notRegistered)
    })

    it('phone number bad call', () => {
      data.originalText = 'blablabla'
      familyMemberMock.restore()
      familyMemberMock = sinon.mock(familyMembers)
      familyMemberMock.expects('retrievePersonFromPhoneNumberPromise').once().callsFake((result) => {
        logger.log('debug', '___retrievePersonFromPhoneNumberPromiseMock_updated')
        result.errorMessage = modelConstants.errorTypes.generalError
        return Q.reject(result)
      })
      return shouldRespondWith(phrases.generalError)
    })
  })
})
