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
const commandTypes = require('./commandtypes')

describe('textProcessor + languageProcessor', () => {
  describe('getlist', () => {
    var listsMock, data

    const item1 = {listItemName: 'item1'}
    const item2 = {listItemName: 'item2'}

    const listExists = () => {
      data.listExist = true
      listsMock.expects('validateListExistsPromise').once().returns(Q.resolve(data))
    }

    const listNotExists = () => {
      data.listExist = false
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
      return shouldRespondWith('Sorry, couldn\'t find #list\nType "get lists" to see what\'s available.')
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
      return shouldRespondWith('Sorry don\'t understand. Type \'packhack\' for help.')
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
      return shouldRespondWith('Sorry please specify a list\ne.g. "get shopping"')
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
        result.responseText.should.equal('Sorry don\'t understand. Type \'packhack\' for help.')
        listsMock.restore()
      })
    })
  })

  describe('createList', () => {
    afterEach(() => {
      lists.validateListExistsPromise.restore()
    })

    it('should only succeed if list does not exist', () => {
      var initialData = {
        originalText: 'create #thelist',
        randomDataToCheckPassthrough: '123'
      }
      sinon.stub(lists, 'validateListExistsPromise').callsFake(data => {
        data.errorMessage = modelConstants.errorTypes.notFound
        data.listExists = false
        return Q.reject(data)
      })
      return textProcessor.processTextPromise(initialData).then(result => {
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
