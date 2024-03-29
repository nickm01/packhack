const config = require('../config')
const mongoose = require('mongoose')
mongoose.Promise = require('q').Promise
const logger = require('winston')
const modelConstants = require('./modelconstants')

mongoose.models = {}
mongoose.modelSchemas = {}

const intialize = () => {
  mongoose.connect(config.mongodbUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', function () {
    logger.log('info', 'DB Connected')
  })
}

// Lists
const listsSchema = mongoose.Schema({
  'listKey': { 'type': String, 'required': true },
  'listDescription': String,
  'familyId': { 'type': String, 'required': true }
}, { versionKey: false })
listsSchema.index({'listKey': 1, 'familyId': 1}, { 'unique': true })
listsSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error(modelConstants.errorTypes.duplicateList))
  } else {
    next(error)
  }
})
const Lists = mongoose.model('Lists', listsSchema, 'Lists')

// ListItems
const listItemsSchema = mongoose.Schema({
  'listKey': { 'type': String, 'required': true },
  'listItemName': { 'type': String, 'required': true },
  'familyId': { 'type': String, 'required': true },
  'reminderWhen': String,
  'reminderUserId': String,
  'reminderTitle': String,
  'reminderListKey': String
}, { versionKey: false })
listItemsSchema.index({'listKey': 1, 'listItemName': 1, 'familyId': 1}, { 'unique': true })
listItemsSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error(modelConstants.errorTypes.duplicateListItem))
  } else {
    next(error)
  }
})
const ListItems = mongoose.model('ListItems', listItemsSchema, 'ListItems')

// FamilyMembers
// Note: Description = what you show (capitalized), Name = what internally the name is (not capitalized)
const familyMemberSchema = mongoose.Schema({
  'userId': { 'type': String, 'required': true },
  'familyId': String,
  'name': String, // first name, lower-cased
  'phoneNumber': { 'type': String, 'required': true },
  'description': String, // capitalized
  'fullDescription': String, // capitalized, including last name
  'timeZone': String,
  'verificationNumber': Number,
  'verificationNumberExpiry': String,
  'fullAccess': Boolean
}, { versionKey: false })
const FamilyMembers = mongoose.model('FamilyMembers', familyMemberSchema, 'FamilyMembers')

// Families
const familySchema = mongoose.Schema({
  'id': { 'type': String, 'required': true },
  'name': { 'type': String, 'required': true }, // internal, lower-cased
  'description': { 'type': String, 'required': true }, // external, capitalized
  'timeZone': String
}, { versionKey: false })
const Families = mongoose.model('Families', familySchema, 'Families')

// Logs
const logsSchema = mongoose.Schema({
  'phoneNumber': String,
  'familyId': String,
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
  Families,
  Logs
}
