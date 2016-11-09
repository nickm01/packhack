var config = require('./config');
var client = require('twilio')(config.accountSid, config.authToken);

module.exports.sendSms = function(to, message, completion) {
  client.messages.create({
    body: message,
    to: to,
    from: config.sendingNumber
    // mediaUrl: 'http://www.yourserver.com/someimage.png'
  }, function(err, data) {
    if (err) {
      console.error('Could not send message');
      console.error(err);
    } else {
      console.error('SMS');
    }
    completion();
  });
};