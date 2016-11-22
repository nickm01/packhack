var config = require('./config')
var mongoOp = require('./model/mongo')
var stringProcessor = require('./stringprocessor')
var dates = require('./dates')

function addReminder (inputText, familyId, timeZone, callback) {
  var sendTo = stringProcessor.getFirstWord(inputText)
  var dateText = stringProcessor.removeFirstWord(inputText)
  var generalError = 'Error creating reminder list 😦'

  mongoOp.FamilyMembers.findOne({ 'name': sendTo, 'familyId': familyId }, function (err, familyMember) {
    if (familyMember == null || err) {
      callback('@' + sendTo + ' unkown sorry! 😕')
    } else {
      var sendToId = familyMember.userId

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
          if (err) callback(err)
          // Create listItem
          var newItem = new mongoOp.ListItems({
            'listKey': config.remindersListKey,
            'listItemName': '@' + sendTo + ' ' + title + ' ' + localDateText,
            'familyId': familyId,
            'reminderWhen': date,
            'reminderUserId': sendToId
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
