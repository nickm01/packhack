var mongoOp = require('./model/mongo')
var logging = require('./logging')

function deleteListItemByName (familyId, listKey, listItemName, callback) {
  mongoOp.ListItems.remove({'listKey': listKey, 'listItemName': listItemName, 'familyId': familyId}, function (err, removeResult) {
    if (err) {
      logging.logError(fromPhoneNumber, familyId, bodyText, err);
      callback('Error removing ' + listItemName + ' 😦')
      return
    }
    console.log('----removed ' + listItemName + ' ' + removeResult.result.n)
    if (removeResult.result.n === 0) {
      callback(listItemName + " doesn't exist in #" + listKey + ' 😦.')
    } else {
      callback(null)
    }
  })
}

function listItemTextForList(list, callback) {
  mongoOp.Lists.findOne({'listKey': list.listKey, 'familyId': list.familyId}, function (err, list) {
    if (err || list == null) {
      callback(err, "Sorry, couldn't find #" + list.listKey + '.\nType "get lists" to see available lists.')
    } else {
      mongoOp.ListItems.find({'listKey': list.listKey, 'familyId': list.familyId}, function (err, listItems) {
        if (err) {
          callback(err)
        } else {
          var concatText = ''
          var itemNumber = 0
          listItems.forEach(function (listItem) {
            itemNumber++
            concatText = concatText.concat('\n• ' + listItem.listItemName)
          })
          if (itemNumber === 0) {
            concatText = concatText.concat('No items in #' + list.listKey + '.')
          }
          callback(null, '\n#' + list.listKey + ':' + concatText)
        }
      })
    }
  })
}

module.exports = {
  deleteListItemByName,
  listItemTextForList
}
