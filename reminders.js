var config = require('./config')
var mongoOp = require('./model/mongo')
var stringProcessor = require('./stringprocessor')
var dates = require('./dates')

function addReminder (inputText, familyId, callback) {
  var sendTo = stringProcessor.getFirstWord(inputText)
  var dateText = stringProcessor.removeFirstWord(inputText)
  var convertedUTCDate = dates.createDateFromText(dateText)

	mongoOp.FamilyMembers.findOne({'name': sendTo, 'familyId':familyId}, function (err, familyMember) {
		if (familyMember == null) {
			callback('@' + sendTo + ' unkown sorry! 😕')
		} else {
			var sendToId = familyMember.userId

			//check lists and create if necessary
			mongoOp.Lists.findOne({'listKey': config.remindersListKey, 'familyId':familyId}, function(err, list) {
				if (list == null) {
					var newList = new mongoOp.Lists({
						"listKey" : config.remindersListKey,
						"listDescription" : config.remindersListKey,
						"familyId" : familyId
					});
					newList.save(function (err, data) {
						if (err) callback('Error creating reminder list 😦');
					});
				}

				//create listItem
				var newItem = new mongoOp.ListItems({
					"listKey" : config.remindersListKey,
					"listItemName" : "Remind: @" + inputText,
					"familyId" : familyId,
					"reminderWhen": convertedUTCDate,
					"reminderUserId": sendToId
				});
				newItem.save(function (err, data) {
					if (err) callback('Error adding reminder 😦');
					else {
						console.log('----reminder saved: ' + inputText + ' Date:' + convertedUTCDate + ' < ' + dateText);
						callback(null)
					}
				});
			});
		}
	});
}

module.exports = {
	addReminder
}
