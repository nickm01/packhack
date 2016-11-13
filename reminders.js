#!/usr/bin/env node

var config = require('../config');
//var twilio = require('twilio')(config.accountSid, config.authToken);
var MongoClient = require('mongodb').MongoClient;
var mongoOp = require('../model/mongo');
var sendSms = require('../sendsms');
var logging = require('../logging');