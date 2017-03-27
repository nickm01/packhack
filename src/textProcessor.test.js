/* eslint-env mocha */
// Above line makes it work with Mocha

const should = require('chai').should()
const textProcessor = require('./textProcessor')

describe('textProcessor', function () {
  describe('basics', function () {
    it('get list no cache', function () {
      const result = textProcessor.processText('get list', null)
    })
  })
})
