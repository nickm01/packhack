
var config = require('./config');
var mongoOp = require('./model/mongo');
var logging = require('./logging');
var stringProcessor = require('./stringprocessor');

function addReminder(inputText, familyID, callback) {
	var sendTo = stringProcessor.getFirstWord(inputText);
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
					"listItemName" : "Reminder @" + inputText,
					"familyId" : familyId,
					"reminderWhen": "2012-04-23T18:25:43.511Z",
					"reminderUserId": sendToId
				});
				newItem.save(function (err, data) {
					if (err) callback('Error adding reminder 😦');
					else {
						console.log('----reminder saved', data );
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