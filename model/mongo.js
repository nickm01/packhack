var mongoose    =   require("mongoose");
//TODO: Shouldn't be saved here
mongoose.connect("mongodb://heroku_x61dp8bp:12f6g0oe2r8hn13jnad3m5or49@ds161495.mlab.com:61495/heroku_x61dp8bp");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected!!!---!!!");
});

// Item Types
var typeSchema  = mongoose.Schema({
    "itemKey" : Number,
    "itemName" : String
}, {
	// Removes the "__v":0 from newly created rows
	versionKey: false
});
var ItemTypes = mongoose.model('ItemTypes',typeSchema, 'ItemTypes');

// Lists
var listsSchema  = mongoose.Schema({
    "listKey" : String,
    "listDescription" : String
}, { versionKey: false });
var Lists = mongoose.model('Lists',listsSchema, 'Lists');

// ListItems
var listItemsSchema  = mongoose.Schema({
    "listKey" : String,
    "listItemName" : String
}, { versionKey: false });
var ListItems = mongoose.model('ListItems',listItemsSchema, 'ListItems');


// create model if not exists.
// Third param is the preexisting collection name
//module.exports allows this to "find" in previous
module.exports = {
    ItemTypes: ItemTypes,
    Lists: Lists,
    ListItems: ListItems
};
