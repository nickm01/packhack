#!/usr/bin/env node

var config = require('../config');
var mongoOp = require('../model/mongo');
var sendSms = require('../sendsms');
var logging = require('../logging');

var listName = getFirstWord(bodyText).substr(1);

function addReminder(inputText, ) {

mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {

	if (list == null) {
		sendSMSResponse(fromPhoneNumber, familyId, bodyText, '#' + listName + ' does not exist.', res);
	} else {
		var addVerbPhrase = '#' + listName + ' add ';
		var removeVerbPhrase = '#' + listName + ' remove ';

    //Add item
    if (bodyText.startsWith(addVerbPhrase)) {
    	var listItemName = bodyText.substr(addVerbPhrase.length);

    	var newItem = new mongoOp.ListItems({
    		"listKey" : listName,
    		"listItemName" : listItemName,
    		"familyId" : familyId
    	});
    	newItem.save(function (err, data) {
    		if (err) logging.logError(fromPhoneNumber, familyId, bodyText, err);
    		else {
    			console.log('----saved ', data );
    			cacheListName(listName,res);
    			sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);  
    		}
    	});