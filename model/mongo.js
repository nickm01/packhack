var mongoose    =   require("mongoose");
mongoose.Promise = global.Promise;
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
    "familyId" : Number
}, { versionKey: false });
var ListItems = mongoose.model('ListItems',listItemsSchema, 'ListItems');

// FamilyMembers
var familyMemberSchema  = mongoose.Schema({
    "id": Number,
    "familyId": Number,
    "name": String,
    "phoneNumber": String,
    "description": String
}, { versionKey: false });
var FamilyMembers = mongoose.model('FamilyMembers',familyMemberSchema, 'FamilyMembers');

module.exports = {
    Lists: Lists,
    ListItems: ListItems,
    FamilyMembers: FamilyMembers
};
