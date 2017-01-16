var mongoose = require("mongoose");
//mongoose.Promise = global.Promise;
mongoose.Promise = require('q').Promise

//TODO: Shouldn't be saved here
mongoose.connect("mongodb://heroku_x61dp8bp:12f6g0oe2r8hn13jnad3m5or49@ds161495.mlab.com:61495/heroku_x61dp8bp");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected!!!---!!!");
});

// Lists
var listsSchema  = mongoose.Schema({
    "listKey" : String,
    "listDescription" : String,
    "familyId" : Number
}, { versionKey: false });
var Lists = mongoose.model('Lists',listsSchema, 'Lists');

// ListItems
var listItemsSchema  = mongoose.Schema({
    "listKey" : String,
    "listItemName" : String,
    "familyId" : Number,
    "reminderWhen": String,
    "reminderUserId": Number,
    "reminderTitle": String,
    "reminderListKey": String
}, { versionKey: false });
var ListItems = mongoose.model('ListItems',listItemsSchema, 'ListItems');

// FamilyMembers
var familyMemberSchema  = mongoose.Schema({
    "userId": Number,
    "familyId": Number,
    "name": String,
    "phoneNumber": String,
    "description": String,
    "timeZone": String
}, { versionKey: false });
var FamilyMembers = mongoose.model('FamilyMembers',familyMemberSchema, 'FamilyMembers');

// Logs
var logsSchema  = mongoose.Schema({
    "phoneNumber" : String,
    "familyId" : Number,
    "message" : String,
    "dateTime" : String,
    "type" : String,
    "response": String
}, { versionKey: false });
var Logs = mongoose.model('Logs',logsSchema, 'Logs');

module.exports = {
    Lists: Lists,
    ListItems: ListItems,
    FamilyMembers: FamilyMembers,
    Logs: Logs
};
