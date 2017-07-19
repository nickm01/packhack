// /* eslint-env mocha */
// // Above line makes it work with Mocha
//
// const addremindersupplementarytextprocessor = require('./commandtextprocessors/addreminder.supplementarytextprocessor')
// const should = require('chai').should()
//
// describe.only('add reminder supplementary text processor', () => {
//   var timezone
//
//   const shouldMatch = (text, expected) => {
//     var data = {timezone: timezone, supplementaryText: text}
//     const someDate = new Date('01/01/2018')
//     addremindersupplementarytextprocessor.retrieveDateAndTitleFromSupplementaryText(data, someDate)
//     var expectedDataAppended = expected.date
//     if (data.timezone === 'America/New_York') {
//       expectedDataAppended += ' GMT-0500 (EST)'
//     } else if (data.timezone === 'GMT') {
//       expectedDataAppended += ' GMT+0000 (GMT)'
//     }
//     data.eventStartDateGMT.toString().should.equal(expectedDataAppended)
//     data.eventUserDateText.should.equal(expected.dateText)
//     data.eventTitle.should.equal(expected.title)
//   }
//
//   // TODO: How to fake timezones for the server
//   describe('GMT Timezone', () => {
//   //   beforeEach(() => { timezone = 'GMT' })
//   //   it('✅ tomorrow go shopping', () => { shouldMatch('tomorrow go shopping', {date: 'Mon Jan 01 2018 00:00:00', dateText: 'Monday, Jan 1st, 2018', title: 'go shopping'}) })
//   //   it('✅ today go shopping', () => { shouldMatch('today go shopping', {date: 'Sun Dec 31 2017 00:00:00', dateText: 'Sunday, Dec 31st', title: 'go shopping'}) })
//   // })
//   //
//   // describe('New York Timezone', () => {
//   //   beforeEach(() => { timezone = 'America/New_York' })
//   //   it('✅ tomorrow go shopping', () => { shouldMatch('tomorrow go shopping', {date: 'Mon Jan 01 2018 00:00:00', dateText: 'Monday, Jan 1st, 2018', title: 'go shopping'}) })
//   //   it('✅ today go shopping', () => { shouldMatch('today go shopping', {date: 'Sun Dec 31 2017 00:00:00', dateText: 'Sunday, Dec 31st', title: 'go shopping'}) })
//   })
// })
