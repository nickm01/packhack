var config = require('./config');
var mongoOp = require('./model/mongo');
var logging = require('./logging');
var stringProcessor = require('./stringprocessor');

function deleteListItemByName(familyId, listKey, listItemName, callback) {
	mongoOp.ListItems.remove({"listKey" : listKey, "listItemName" : listItemName, 'familyId': familyId}, function(err, removeResult) {
	  if (err) {
	    logging.logError(fromPhoneNumber, familyId, bodyText, err);
	    callback('Error removing ' + listItemName + ' 😦');
	    return;
	  }
	  console.log('----removed ' + listItemName + ' ' + removeResult.result.n);
	  if (removeResult.result.n === 0) {
	    callback(listItemName + " doesn't exist in #" + listKey + " 😦."); 
	  } else {
	  	callback(null);
	  }
	});
}

module.exports = {
	deleteListItemByName
}