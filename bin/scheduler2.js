#!/usr/bin/env node
var config = require('../config')
var mongoOp = require('../model/mongo')
var sendSms = require('../sendsms')
var logging = require('../logging')
var listItemFunctions = require('../listitems')
var Q = require('q')

var count = 0

processScheduler()

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

        if (reminderDate < now) {
          listItemPromises.push(
            deleteListItemByNamePromise(listItem)
            .then(multipleOrSingleFamilyMembersForReminderUserIdPromise)
            .then(sendSmsForAllListItemFamilyMembersPromise)
          )
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

function deleteListItemByNamePromise (listItem) {
  var promise = mongoOp.ListItems.remove(listItem)
    .exec()
    .then(function (removeResult) {
      if (removeResult.result.n !== 1) {
        throw new Error('Error in completing the reminder 😦.')
      } else {
        console.log('---- Removed ' + listItem.listItemName + ' ' + removeResult.result.n)
        return listItem
      }
    })
  return promise
}

function multipleOrSingleFamilyMembersForReminderUserIdPromise (listItem) {
  var promise
  console.log('* FAM ID:' + listItem.familyId + ' UserId:' + listItem.reminderUserId)
  if (listItem.reminderUserId !== config.allFamilyMembersID) {
    promise = mongoOp.FamilyMembers.findOne({'familyId': listItem.familyId, 'userId': listItem.reminderUserId})
      .exec()
      .then(function (familyMember) {
        console.log('* FAM-SINGLE pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
        return [{listItem, familyMember}]
      })
  } else {
    promise = mongoOp.FamilyMembers.find({'familyId': listItem.familyId})
      .exec()
      .then(function (familyMembers) {
        return familyMembers.map(function (familyMember) {
          console.log('* FAM-MUTLI pn:' + familyMember.phoneNumber + ' ' + familyMember.name)
          return ({listItem, familyMember})
        })
      })
  }
  return promise
}

function sendSmsForAllListItemFamilyMembersPromise (listItemFamilyMembers) {
  var sendPromises = listItemFamilyMembers.map(function (listItemFamilyMember) {
    return textForReminderPromise(listItemFamilyMember)
    .then(smsPromise)
  })
  return Q.all(sendPromises)
  .then(function (something) {
  })
}

function textForReminderPromise (listItemFamilyMember) {
  var listItem = listItemFamilyMember.listItem
  var toFamilyMember = listItemFamilyMember.familyMember
  var deferred = Q.defer()
  var reminderText = ''
  if (listItem.reminderListKey == null || listItem.reminderListKey === '') {
    reminderText = listItem.reminderTitle
    deferred.resolve({listItem, toFamilyMember, reminderText})
  } else {
    var unconfirmedList = {'listKey': listItem.reminderListKey, 'familyId': listItem.familyId}
    listItemFunctions.listItemsTextForList(unconfirmedList, function (err, text) {
      if (err) {
        if (reminderText !== '') {
          reminderText += '\n'
        }
        reminderText += "(Sorry, couldn't find #" + listItem.reminderListKey + '.)'
      } else {
        if (text === '' && listItem.reminderTitle === '') {
          reminderText = '#' + listItem.reminderListKey + ' - currently empty.'
        } else if (text === '' && listItem.reminderTitle !== '') {
          reminderText = listItem.reminderTitle + '\n(#' + listItem.reminderListKey + ' is currently empty.)'
        } else if (text !== '' && listItem.reminderTitle === '') {
          reminderText = '#' + listItem.reminderListKey + ':' + text
        } else if (text !== '' && listItem.reminderTitle !== '') {
          reminderText = listItem.reminderTitle + '\n#' + listItem.reminderListKey + ':' + text
        }
      }
      deferred.resolve({listItem, toFamilyMember, reminderText})
    })
  }
  return deferred.promise
}

function smsPromise (listItemFamilyMemberReminderText) {
  var toFamilyMember = listItemFamilyMemberReminderText.toFamilyMember
  var reminderText = '⏰ ' + listItemFamilyMemberReminderText.reminderText
  var deferred = Q.defer()
  count++
  console.log('Count++ ' + count + ' pn:' + toFamilyMember.phoneNumber + ' ' + toFamilyMember.name + ':' + reminderText)
  logging.log(toFamilyMember.phoneNumber, toFamilyMember.familyId, reminderText, 'Reminder', '')
  sendSms.sendSms(toFamilyMember.phoneNumber, reminderText, function () {
    deferred.resolve('sent')
  })
  return deferred.promise
}
