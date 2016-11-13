//var dotenv = require('dotenv');
var cfg = {};


// if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
//   dotenv.config({path: '.env'});
// } else {
//   dotenv.config({path: '.env.test', silent: true});
// }

// HTTP Port to run our web application
//cfg.port = process.env.PORT || 3000;

// A random string that will help generate secure one-time passwords and
// HTTP sessions
//cfg.secret = process.env.APP_SECRET || 'keyboard cat';

// Your Twilio account SID and auth token, both found at:
// https://www.twilio.com/user/account
//
// A good practice is to store these string values as system environment
// variables, and load them from there as we are doing below. Alternately,
// you could hard code these values here as strings.
//cfg.accountSid = process.env.TWILIO_ACCOUNT_SID;
//cfg.authToken = process.env.TWILIO_AUTH_TOKEN;
//cfg.sendingNumber = process.env.TWILIO_NUMBER;

cfg.accountSid = 'ACa4428c20c2064813618957dbece7ef34';
cfg.authToken = '63b9107ef3983ed2869fb402955369aa';
cfg.sendingNumber = '+19148195134';

// Special Reserved ListNames
cfg.remindersListKey = 'reminders'

//var requiredConfig = [cfg.accountSid, cfg.authToken, cfg.sendingNumber];
//var isConfigured = requiredConfig.every(function(configValue) {
//  return configValue || false;
//});

//if (!isConfigured) {
//  var errorMessage =
//    'TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_NUMBER must be set.'00000;
//
//  throw new Error(errorMessage);
//}

// Export configuration object
module.exports = cfg;