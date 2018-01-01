const config = require('../config')
const mongoose = require('mongoose')
mongoose.Promise = require('q').Promise
const logger = require('winston')
const modelConstants = require('./modelconstants')

mongoose.models = {}
mongoose.modelSchemas = {}

const intialize = () => {
  mongoose.connect(config.mongodbUri, {
    useMongoClient: true
  })
  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', function () {
    logger.log('info', 'DB Connected')
    console.log(db.applications.getIndexes())
  })
}

// Lists
const listsSchema = mongoose.Schema({
  'listKey': { 'type': String, 'required': true },
  'listDescription': String,
  'familyId': { 'type': Number, 'required': true },
}, { versionKey: false })
listsSchema.index({ 'listKey': 1, 'familyId': 1}, { 'unique': true })
listsSchema.post('save', function(error, doc, next) {
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
  'familyId':  { 'type': Number, 'required': true },
  'reminderWhen': String,
  'reminderUserId': String,
  'reminderTitle': String,
  'reminderListKey': String
}, { versionKey: false })
listItemsSchema.index({ 'listKey': 1, 'listItemName': 1, 'familyId': 1}, { 'unique': true })
listItemsSchema.post('save', function(error, doc, next) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error(modelConstants.errorTypes.duplicateListItem))
  } else {
    next(error)
  }
})
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
