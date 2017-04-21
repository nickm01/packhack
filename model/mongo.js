var mongoose = require('mongoose')
mongoose.Promise = require('q').Promise

const intialize = () => {
  // TODO: Shouldn't be saved here
  mongoose.connect('mongodb://heroku_x61dp8bp:12f6g0oe2r8hn13jnad3m5or49@ds161495.mlab.com:61495/heroku_x61dp8bp')
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', function () {
    console.log('db connected')
  })
}

// Lists
const listsSchema = mongoose.Schema({
  'listKey': String,
  'listDescription': String,
  'familyId': Number
}, { versionKey: false })
const Lists = mongoose.model('Lists', listsSchema, 'Lists')

// ListItems
const listItemsSchema = mongoose.Schema({
  'listKey': String,
  'listItemName': String,
  'familyId': Number,
  'reminderWhen': String,
  'reminderUserId': Number,
  'reminderTitle': String,
  'reminderListKey': String
}, { versionKey: false })
const ListItems = mongoose.model('ListItems', listItemsSchema, 'ListItems')

// FamilyMembers
const familyMemberSchema = mongoose.Schema({
  'userId': Number,
  'familyId': Number,
  'name': String,
  'phoneNumber': String,
  'description': String,
  'timeZone': String
}, { versionKey: false })
const FamilyMembers = mongoose.model('FamilyMembers', familyMemberSchema, 'FamilyMembers')

// Logs
const logsSchema = mongoose.Schema({
  'phoneNumber': String,
  'familyId': Number,
  'message': String,
  'dateTime': String,
  'type': String,
  'response': String
}, { versionKey: false })
const Logs = mongoose.model('Logs', logsSchema, 'Logs')

module.exports = {
  intialize,
  Lists,
  ListItems,
  FamilyMembers,
  Logs
}
