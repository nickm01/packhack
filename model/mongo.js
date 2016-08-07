var mongoose    =   require("mongoose");
mongoose.connect("mongodb://heroku_b8s72bwg:vf37fvdjf2lp6kb742q35da40b@ds011311.mlab.com:11311/heroku_b8s72bwg");

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("connected!!!---!!!");
});

// create instance of Schema
//var mongoSchema =   mongoose.Schema;
// create schema
var typeSchema  = mongoose.Schema({
    "itemKey" : Number,
    "itemName" : String
}, {
	// Removes the "__v":0 from newly created rows
	versionKey: false
});
var ItemTypes = mongoose.model('ItemTypes',typeSchema, 'ItemTypes');

var listSchema  = mongoose.Schema({
    "listKey" : String,
    "listDescription" : String
}, {
	// Removes the "__v":0 from newly created rows
	versionKey: false
});
var Lists = mongoose.model('ItemTypes',typeSchema, 'ItemTypes');
// create model if not exists.
// Third param is the preexisting collection name
//module.exports allows this to "find" in previous
module.exports = {
    ItemTypes: ItemTypes,
    Lists: Lists,
};
