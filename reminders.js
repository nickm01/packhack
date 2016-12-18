var config = require('./config')
var mongoOp = require('./model/mongo')
var stringProcessor = require('./stringprocessor')
var dates = require('./dates')

// Example of promisifying
// function doSomething(input) {
//   console.log('hello' + input)
//   return Q.resolve();
// }

// const addReminder = (sendTo, familyId) => {
//
//   return Q.ninvoke(mongoOp.FamilyMembers, 'findOne', { 'name': sendTo, 'familyId': familyId }) //wraps n a promise
//   .catch(() => Q.reject('@' + sendTo + ' unkown sorry! 😕'))
//   //.then(doSomething) // automatically sends the result (the second parameter) to the function doSomething
//   .then(familyMember => {
//     return Q.ninvoke(mongoOp.Lists, 'findOne', {'listKey': config.remindersListKey, 'familyId': familyId})
//         .catch(() => Q.reject('second error')) // 'Second error' will be the actual error
//       })
// }

function addReminder (inputText, familyId, timeZone, callback) {
  var sendTo = stringProcessor.getFirstWord(inputText)
  var dateText = stringProcessor.removeFirstWord(inputText)
  dateText = dateText.replace('weekend', 'saturday')
  var generalError = 'Error creating reminder list 😦'

  // Q.ninvoke(mongoOp.FamilyMembers, 'findOne', { 'name': sendTo, 'familyId': familyId }) //wraps n a promise
  // .catch(() => Q.reject('@' + sendTo + ' unkown sorry! 😕'))
  // .then(doSomething) // automatically sends the result (the second parameter) to the function doSomething
  // .then(familyMember => {
  //
  //   return Q.ninvoke(mongoOp.Lists, 'findOne', {'listKey': config.remindersListKey, 'familyId': familyId})
  //       .catch(() => Q.reject('second error')) // 'Second error' will be the actual error
  //     })
  // .catch(err => {
  //   callback(err)
  // })

  mongoOp.FamilyMembers.findOne({ 'name': sendTo, 'familyId': familyId }, function (err, familyMember) {
    if ((familyMember == null || err) && (sendTo !== 'all')) {
      callback('@' + sendTo + ' unkown sorry! 😕')
    } else {
      var sendToId = familyMember.userId || config.allFamilyMembersID

      // Check lists and create if necessary
      mongoOp.Lists.findOne({'listKey': config.remindersListKey, 'familyId': familyId}, function (err, list) {
        if (err) callback(generalError)
        if (list == null) {
          var newList = new mongoOp.Lists({
            'listKey': config.remindersListKey,
            'listDescription': config.remindersListKey,
            'familyId': familyId
          })
          newList.save(function (err, data) {
            if (err) callback(generalError)
          })
        }
        dates.processDateAndTitleFromText(dateText, timeZone, function (err, date, localDateText, title) {
          if (err) {
            callback(err)
            return
          }

          if (title == null || title === '') {
            callback('Sorry need a reminder desciption 😦\nJust add one to the end.')
            return
          }

          // Create listItem
          var newItem = new mongoOp.ListItems({
            'listKey': config.remindersListKey,
            'listItemName': '@' + sendTo + ' ' + title + ' ' + localDateText,
            'familyId': familyId,
            'reminderWhen': date,
            'reminderUserId': sendToId,
            'reminderTitle': title
          })
          newItem.save(function (err, data) {
            if (err) callback('Error adding reminder 😦')
            else {
              console.log('----reminder saved: ' + inputText + ' Sherlocked:' + date + ' < ' + title)
              callback(null, 'Set for ' + localDateText + '.')
            }
          })
        })
      })
    }
  })
}

module.exports = {
  addReminder
}
