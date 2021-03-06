const mongoOp = require('../model/mongo')
const logger = require('winston')

function deleteListItemByName (familyId, listKey, listItemName, callback) {
  mongoOp.ListItems.deleteMany({'listKey': listKey, 'listItemName': listItemName, 'familyId': familyId}, function (err, removeResult) {
    if (err) {
      callback('Error removing ' + listItemName + ' 😦')
      return
    }
    logger.log('debug', '----removed ' + listItemName + ' ' + removeResult.result.n)
    if (removeResult.result.n === 0) {
      callback(listItemName + " doesn't exist in #" + listKey + ' 😦.')
    } else {
      callback(null)
    }
  })
}

function listItemsTextForList (unconfirmedList, callback) {
  mongoOp.Lists.findOne({'listKey': unconfirmedList.listKey, 'familyId': unconfirmedList.familyId}, function (err, list) {
    if (err || list == null) {
      callback(err || true, "Sorry, couldn't find #" + unconfirmedList.listKey + '.\nType "get lists" to see available lists.')
    } else {
      mongoOp.ListItems.find({'listKey': list.listKey, 'familyId': list.familyId}, function (err, listItems) {
        if (err) {
          callback(err)
        } else {
          var concatText = ''
          listItems.forEach(function (listItem) {
            concatText = concatText.concat('\n• ' + listItem.listItemName)
          })
          callback(null, concatText)
        }
      })
    }
  })
}

module.exports = {
  deleteListItemByName,
  listItemsTextForList
}
