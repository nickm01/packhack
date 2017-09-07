/* eslint-env mocha */
// Above line makes it work with Mocha

// NOTE:Run these tests assuming running on a GMT server
// For mocha, use switch env TZ='etc/GMT'.

const addremindersupplementarytextprocessor = require('./addreminder.supplementarytextprocessor')
const should = require('chai').should()
const sinon = require('sinon')
const errors = require('./../errors')

describe('add reminder supplementary text processor', () => {
  let timezone, clock, now

  afterEach(() => {
    if (clock) {
      clock.restore()
    }
  })

  const shouldMatch = (text, expected) => {
    var data = {timezone: timezone, supplementaryText: text}
    clock = sinon.useFakeTimers(now.getTime())
    addremindersupplementarytextprocessor.retrieveDateAndTitleFromSupplementaryText(data)
    var expectedDataAppended = expected.dateGMT + ' GMT+0000 (GMT)'
    data.reminderWhenGMT.toString().should.equal(expectedDataAppended)
    data.reminderUserDateText.should.equal(expected.dateText)
    data.reminderTitle.should.equal(expected.title)
  }

  const shouldError = (text, expectedError) => {
    var data = {timezone: timezone, supplementaryText: text}
    clock = sinon.useFakeTimers(now.getTime())
    try {
      addremindersupplementarytextprocessor.retrieveDateAndTitleFromSupplementaryText(data)
      should.fail('should fail')
    } catch (result) {
      result.errorMessage.should.equal(expectedError)
    }
  }

  describe('GMT Timezone Midnight', () => {
    beforeEach(() => {
      timezone = 'GMT'
      now = new Date('01/01/2017 GMT+0000')
    })
    it('✅ tomorrow go shopping', () => { shouldMatch('tomorrow go shopping', {dateGMT: 'Mon Jan 02 2017 00:00:00', dateText: 'Monday, Jan 2nd', title: 'go shopping'}) })
    it('✅ today go shopping', () => { shouldMatch('today go shopping', {dateGMT: 'Sun Jan 01 2017 00:00:00', dateText: 'Sunday, Jan 1st', title: 'go shopping'}) })
    it('✅ today 2pm go shopping', () => { shouldMatch('2pm go shopping', {dateGMT: 'Sun Jan 01 2017 14:00:00', dateText: 'Sunday 2pm, Jan 1st', title: 'go shopping'}) })
    it('✅ next week go shopping', () => { shouldMatch('next week go shopping', {dateGMT: 'Sun Jan 08 2017 00:00:00', dateText: 'Sunday, Jan 8th', title: 'go shopping'}) })
    it('✅ thursday noon go shopping', () => { shouldMatch('thursday noon go shopping', {dateGMT: 'Thu Jan 05 2017 12:00:00', dateText: 'Thursday 12pm, Jan 5th', title: 'go shopping'}) })
    it('✅ yesterday reminder', () => { shouldMatch('yesterday reminder', {dateGMT: 'Sat Dec 31 2016 00:00:00', dateText: 'Saturday, Dec 31st, 2016', title: 'reminder'}) })
    it('✅ next month 1:36:44am eclipse', () => { shouldMatch('next month 1:36am eclipse', {dateGMT: 'Wed Feb 01 2017 01:36:00', dateText: 'Wednesday 1:36am, Feb 1st', title: 'eclipse'}) })
    it('✅ fri go shopping', () => { shouldMatch('fri go shopping', {dateGMT: 'Fri Jan 06 2017 00:00:00', dateText: 'Friday, Jan 6th', title: 'go shopping'}) })
    it('✅ go shopping tonight', () => { shouldMatch('go shopping tonight', {dateGMT: 'Sun Jan 01 2017 21:00:00', dateText: 'Sunday 9pm, Jan 1st', title: 'go shopping'}) })
    it('✅ go party 12/31/2017 evening', () => { shouldMatch('go party 12/31/2017 evening', {dateGMT: 'Sun Dec 31 2017 19:00:00', dateText: 'Sunday 7pm, Dec 31st', title: 'go party'}) })
    it('❌ go shopping', () => { shouldError('go shopping', errors.errorTypes.noDateTime) })
    it('❌ tomorrow', () => { shouldError('tomorrow', errors.errorTypes.noTitle) })
    it('❌ empty', () => { shouldError('', errors.errorTypes.noDateTime) })
  })

  describe('New York Timezone 8pm', () => {
    beforeEach(() => {
      timezone = 'America/New_York'
      now = new Date('01/01/2017 22:00:00 GMT-0500')
    })
    it('✅ today go shopping', () => { shouldMatch('today go shopping', {dateGMT: 'Sun Jan 01 2017 05:00:00', dateText: 'Sunday, Jan 1st', title: 'go shopping'}) })
    it('✅ go shopping tomorrow', () => { shouldMatch('go shopping tomorrow', {dateGMT: 'Mon Jan 02 2017 05:00:00', dateText: 'Monday, Jan 2nd', title: 'go shopping'}) })
    it('✅ go shopping tomorrow night', () => { shouldMatch('go shopping tomorrow night', {dateGMT: 'Tue Jan 03 2017 02:00:00', dateText: 'Monday 9pm, Jan 2nd', title: 'go shopping'}) })
    it('✅ go shopping yesterday', () => { shouldMatch('go shopping yesterday', {dateGMT: 'Sat Dec 31 2016 05:00:00', dateText: 'Saturday, Dec 31st, 2016', title: 'go shopping'}) })
    it('✅ Jan 1 2018 morning write new years intentions', () => { shouldMatch('Jan 1 2018 morning write new years intentions', {dateGMT: 'Mon Jan 01 2018 13:00:00', dateText: 'Monday 8am, Jan 1st, 2018', title: 'write new years intentions'}) })
    it('✅ next month pay bills', () => { shouldMatch('next month pay bills', {dateGMT: 'Wed Feb 01 2017 05:00:00', dateText: 'Wednesday, Feb 1st', title: 'pay bills'}) })
  })

  describe('New York Timezone 3am', () => {
    beforeEach(() => {
      timezone = 'America/New_York'
      now = new Date('01/01/2017 03:00:00 GMT-0500')
    })
    it('✅ today go shopping', () => { shouldMatch('today go shopping', {dateGMT: 'Sun Jan 01 2017 05:00:00', dateText: 'Sunday, Jan 1st', title: 'go shopping'}) })
    it('✅ go shopping tomorrow', () => { shouldMatch('go shopping tomorrow', {dateGMT: 'Mon Jan 02 2017 05:00:00', dateText: 'Monday, Jan 2nd', title: 'go shopping'}) })
    it('✅ go shopping afternoon', () => { shouldMatch('go shopping afternoon', {dateGMT: 'Sun Jan 01 2017 19:00:00', dateText: 'Sunday 2pm, Jan 1st', title: 'go shopping'}) })
    it('✅ date-night Feb 1st, 8pm', () => { shouldMatch('date-night Feb 1st, 8pm', {dateGMT: 'Thu Feb 02 2017 01:00:00', dateText: 'Wednesday 8pm, Feb 1st', title: 'date-night'}) })
  })

  describe('Russia Timezone 3am', () => {
    beforeEach(() => {
      timezone = 'Europe/Moscow'
      now = new Date('01/01/2017 03:00:00 GMT+0300')
    })
    it('✅ today go shopping', () => { shouldMatch('today go shopping', {dateGMT: 'Sat Dec 31 2016 21:00:00', dateText: 'Sunday, Jan 1st', title: 'go shopping'}) })
    it('✅ go shopping tomorrow', () => { shouldMatch('go shopping tomorrow', {dateGMT: 'Sun Jan 01 2017 21:00:00', dateText: 'Monday, Jan 2nd', title: 'go shopping'}) })
  })
})
