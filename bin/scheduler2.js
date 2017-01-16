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
      listItems.forEach(function (listItem) {
        var familyId = listItem.familyId
        var reminderDate = new Date(listItem.reminderWhen)
        var now = new Date()
        console.log('now: ' + now)
        console.log('Scheduler2:' + reminderDate + ' userId:' + listItem.reminderUserId + ' listItemName:' + listItem.listItemName)

        if (reminderDate < now) {
          // Remove listItem first
          listItemFunctions.deleteListItemByName(familyId, listItem.listKey, listItem.listItemName, function (err) {
            if (err) {
              return
            } else {
              // Send to single or multiple family members
              multipleOrSingleFamilyMembersForReminderUserId(familyId, listItem.reminderUserId, function (err, familyMember) {
                if (err) {
                  logging.logError('0', familyId, listItem, err)
                  return
                }
                count++

                // textForReminder(listItem, function (err, text) {
                //   if (err) {
                //   }
                //   text = '⏰ ' + text
                //   console.log('Count++ ' + count + ' pn:' + familyMember.phoneNumber + ' ' + familyMember.name + ':' + text)
                //   logging.log(familyMember.phoneNumber, familyId, text, 'Reminder', '')
                //   sendSms.sendSms(familyMember.phoneNumber, text, function () {
                //     count--
                //     console.log('Count-- ' + count)
                //     if (count === 0) {
                //       process.exit()
                //     }
                //   })
                // })
              })
            }
          })
        }
      })
    }
  })
}

function multipleOrSingleFamilyMembersForReminderUserId (familyId, reminderUserId, callback) {
  console.log('FAM ID:' + familyId + ' UserId:' + reminderUserId)
  if (reminderUserId !== config.allFamilyMembersID) {
    mongoOp.FamilyMembers.findOne({'familyId': familyId, 'userId': reminderUserId}, function (err, familyMember) {
      console.log('FAM-SINGLE pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
      callback(err, familyMember)
    })
  } else {
    mongoOp.FamilyMembers.find({'familyId': familyId}, function (err, familyMembers) {
      if (err) {
        callback(err)
      } else {
        familyMembers.forEach(function (familyMember) {
          console.log('FAM-MUTLI pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
          callback(null, familyMember)
        })
      }
    })
  }
}

function multipleOrSingleFamilyMembersForReminderUserIdPromise (familyId, reminderUserId, callback) {
  var familyMembersDeferred = Q.defer()
  console.log('FAM ID:' + familyId + ' UserId:' + reminderUserId)
  if (reminderUserId !== config.allFamilyMembersID) {
    mongoOp.FamilyMembers.findOne({'familyId': familyId, 'userId': reminderUserId}, function (err, familyMember) {
      console.log('FAM-SINGLE pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
      if (err) {
        return familyMembersDeferred.reject(err)
      } else {
        return familyMembersDeferred.resolve(familyMember)
      }
    })
  } else {
    mongoOp.FamilyMembers.find({'familyId': familyId}, function (err, familyMembers) {
      if (err) {
        callback(err)
      } else {
        familyMembers.forEach(function (familyMember) {
          console.log('FAM-MUTLI pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
          callback(null, familyMember)
        })
      }
    })
  }
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

processScheduler()
