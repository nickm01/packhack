#!/usr/bin/env node

var config = require('../config')
var mongoOp = require('../model/mongo')
var sendSms = require('../sendsms')
var logging = require('../logging')
var listItemFunctions = require('../listitems')
var Q = require('q')

var count = 0

function processScheduler () {
  mongoOp.ListItems.find({'listKey': config.remindersListKey}, function (err, listItems) {
    if (err) {
      logging.logError('scheduler', '', '', err)
    } else {
      var listItemPromises = []
      listItems.forEach(function (listItem) {
        var reminderDate = new Date(listItem.reminderWhen)
        var now = new Date()
        console.log('now: ' + now)
        console.log('Scheduler2:' + reminderDate + ' userId:' + listItem.reminderUserId + ' listItemName:' + listItem.listItemName)

        // TODO: Do the delete at the end of a promise chain
        if (reminderDate < now || reminderDate > now) { // TODO: Remove second clause
          console.log('A1: ' + listItem)
          listItemPromises.push(
            deleteListItemByNamePromise(listItem)
            .then(multipleOrSingleFamilyMembersForReminderUserIdPromise)
            .then(function (something) {
              console.log('X: ' + something + ' count ' + something.length)
              return something
            })

          )
          // Remove listItem first
          // listItemFunctions.deleteListItemByName(familyId, listItem.listKey, listItem.listItemName, function (err) {
          //   if (err) {
          //     return
          //   } else {
          //     // Send to single or multiple family members
          //     multipleOrSingleFamilyMembersForReminderUserId(familyId, listItem.reminderUserId, function (err, familyMember) {
          //       if (err) {
          //         logging.logError('0', familyId, listItem, err)
          //         return
          //       }
          //       count++
          //
          //       // textForReminder(listItem, function (err, text) {
          //       //   if (err) {
          //       //   }
          //       //   text = '⏰ ' + text
          //       //   console.log('Count++ ' + count + ' pn:' + familyMember.phoneNumber + ' ' + familyMember.name + ':' + text)
          //       //   logging.log(familyMember.phoneNumber, familyId, text, 'Reminder', '')
          //       //   sendSms.sendSms(familyMember.phoneNumber, text, function () {
          //       //     count--
          //       //     console.log('Count-- ' + count)
          //       //     if (count === 0) {
          //       //       process.exit()
          //       //     }
          //       //   })
          //       // })
          //     })
          //   }
          // })
        }
      })
      console.log('Promises: ' + listItemPromises.length)
      Q.all(listItemPromises)
        .then(function (result) {
          console.log(result)
          console.log('*** COMPLETE ***')
          process.exit()
        }, function (error) {
          console.error(error)
          console.log('*** COMPLETE IN ERROR ***')
          process.exit()
        })
    }
  })
}

// function multipleOrSingleFamilyMembersForReminderUserId (familyId, reminderUserId, callback) {
//   console.log('FAM ID:' + familyId + ' UserId:' + reminderUserId)
//   if (reminderUserId !== config.allFamilyMembersID) {
//     mongoOp.FamilyMembers.findOne({'familyId': familyId, 'userId': reminderUserId}, function (err, familyMember) {
//       console.log('FAM-SINGLE pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
//       callback(err, familyMember)
//     })
//   } else {
//     mongoOp.FamilyMembers.find({'familyId': familyId}, function (err, familyMembers) {
//       if (err) {
//         callback(err)
//       } else {
//         familyMembers.forEach(function (familyMember) {
//           console.log('FAM-MUTLI pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
//           callback(null, familyMember)
//         })
//       }
//     })
//   }
// }

// function multipleOrSingleFamilyMembersForReminderUserIdPromise2 (listItem) {
//   var promise
//   console.log('FAM ID:' + listItem.familyId + ' UserId:' + listItem.reminderUserId)
//   if (listItem.reminderUserId !== config.allFamilyMembersID) {
//     promise = mongoOp.FamilyMembers.findOne({'familyId': listItem.familyId, 'userId': listItem.reminderUserId})
//       .exec()
//   } else {
//     promise = mongoOp.FamilyMembers.find({'familyId': listItem.familyId})
//       .exec()
//   }
//   return promise
// }

function multipleOrSingleFamilyMembersForReminderUserIdPromise (listItem) {
  var familyMembersDeferred = Q.defer()
  console.log('FAM ID:' + listItem.familyId + ' UserId:' + listItem.reminderUserId)
  if (listItem.reminderUserId !== config.allFamilyMembersID) {
    mongoOp.FamilyMembers.findOne({'familyId': listItem.familyId, 'userId': listItem.reminderUserId}, function (err, familyMember) {
      console.log('FAM-SINGLE pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
      if (err) {
        return familyMembersDeferred.reject(err)
      } else {
        return familyMembersDeferred.resolve([familyMember, listItem])
      }
    })
  } else {
    mongoOp.FamilyMembers.find({'familyId': listItem.familyId}, function (err, familyMembers) {
      if (err) {
        return familyMembersDeferred.reject(err)
      } else {
        familyMembers.forEach(function (familyMember) {
          console.log('FAM-MUTLI pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
        })
        var result = familyMembers.map(function (familyMember) {
          console.log('QQ: ' + familyMember + ' WW: ' + listItem)
          return ({familyMember, listItem})
        })
        return familyMembersDeferred.resolve(result)
      }
    })
  }
  return familyMembersDeferred.promise
}

function textForReminder (listItem, callback) {
  if (listItem.reminderListKey == null || listItem.reminderListKey === '') {
    callback(null, listItem.reminderTitle)
  } else {
    var unconfirmedList = {'listKey': listItem.reminderListKey, 'familyId': listItem.familyId}
    listItemFunctions.listItemsTextForList(unconfirmedList, function (err, text) {
      if (err) {
        callback(err, "(Sorry, couldn't find #" + listItem.reminderListKey + '.)')
      } else {
        var reminderText = ''
        if (text === '' && listItem.reminderTitle === '') {
          reminderText = '#' + listItem.reminderListKey + ' - currently empty.'
        } else if (text === '' && listItem.reminderTitle !== '') {
          reminderText = listItem.reminderTitle + '\n(#' + listItem.reminderListKey + ' is currently empty.)'
        } else if (text !== '' && listItem.reminderTitle === '') {
          reminderText = '#' + listItem.reminderListKey + ':' + text
        } else if (text !== '' && listItem.reminderTitle !== '') {
          reminderText = listItem.reminderTitle + '\n#' + listItem.reminderListKey + ':' + text
        }
        callback(null, reminderText)
      }
    })
  }
}

function textForReminderPromise (listItem) {
  var deferred = Q.defer()
  if (listItem.reminderListKey == null || listItem.reminderListKey === '') {
    return deferred.resolve(listItem.reminderTitle)
  } else {
    var unconfirmedList = {'listKey': listItem.reminderListKey, 'familyId': listItem.familyId}
    listItemFunctions.listItemsTextForList(unconfirmedList, function (err, text) {
      if (err) {
        return deferred.reject("(Sorry, couldn't find #" + listItem.reminderListKey + '.)')
      } else {
        var reminderText = ''
        if (text === '' && listItem.reminderTitle === '') {
          reminderText = '#' + listItem.reminderListKey + ' - currently empty.'
        } else if (text === '' && listItem.reminderTitle !== '') {
          reminderText = listItem.reminderTitle + '\n(#' + listItem.reminderListKey + ' is currently empty.)'
        } else if (text !== '' && listItem.reminderTitle === '') {
          reminderText = '#' + listItem.reminderListKey + ':' + text
        } else if (text !== '' && listItem.reminderTitle !== '') {
          reminderText = listItem.reminderTitle + '\n#' + listItem.reminderListKey + ':' + text
        }
        return deferred.resolve(reminderText)
      }
    })
  }
}

function smsPromise (messageDetails) {
  var deferredSms = Q.defer()
  var reminderText = '⏰ ' + messageDetails.text
  count++
  console.log('Count++ ' + count + ' pn:' + messageDetails.phoneNumber + ' ' + messageDetails.name + ':' + reminderText)
  logging.log(messageDetails.phoneNumber, messageDetails.familyId, reminderText, 'Reminder', '')
  sendSms.sendSms(messageDetails.phoneNumber, reminderText, function () {
    return deferredSms.resolve
  })
}

// TODO: Move
processScheduler()

// Attempt 2 : Use mongoose promises
function deleteListItemByNamePromise (listItem) {
  var promise = mongoOp.ListItems.remove(listItem)
    .exec()
    .then(function (removeResult) {
      console.log('XB2: ' + removeResult)
      if (removeResult.result.n !== 1) {
        throw new Error(listItem.listItemName + " doesn't exist in #" + listItem.listKey + ' 😦.')
      } else {
        console.log('---- Removed ' + listItem.listItemName + ' ' + removeResult.result.n)
        return listItem
      }
    })
  return promise
}

// MOVE TO SCHEDULEITEM
// function deleteListItemByNamePromise (listItem) {
//   var deferred = Q.defer()
//   console.log('B2: ' + listItem)
//   mongoOp.ListItems.remove({'listKey': listItem.listKey, 'listItemName': listItem.listItemName, 'familyId': listItem.familyId}, function (err, removeResult) {
//     console.log('C3 err:' + err)
//     if (err) {
//       return deferred.reject('Error removing ' + listItem.listItemName + ' 😦')
//     }
//     console.log('----removed ' + listItem.listItemName + ' ' + removeResult.result.n)
//     if (removeResult.result.n === 0) {
//       return deferred.reject(listItem.listItemName + " doesn't exist in #" + listItem.listKey + ' 😦.')
//     } else {
//       return deferred.resolve(listItem)
//     }
//   })
//   return deferred.promise
// }
