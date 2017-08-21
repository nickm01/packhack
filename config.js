// Default dummy values exist in order to allow unit tests to run

module.exports = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || 'TWILIO_ACCOUNT_SID',
  authToken: process.env.TWILIO_AUTH_TOKEN || 'TWILIO_AUTH_TOKEN',
  sendingNumber: process.env.TWILIO_NUMBER || 'TWILIO_NUMBER',
  mongodbUri: process.env.MONGODB_URI || 'MONGODB_URI',
  remindersListKey: 'reminders'
}
