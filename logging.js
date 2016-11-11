var mongoOp = require("./model/mongo");

function logError(phoneNumber, familyId, message, err) {
  log(phoneNumber, familyId, inMessage, "error", err);  
  console.log(err);
}

function log(phoneNumber, familyId, message, type, response) {
  var newLog = new mongoOp.Logs({
    "phoneNumber" : phoneNumber,
    "familyId" : familyId,
    "message" : message,
    "dateTime" : Date(),
    "type" : type,
    "response" : response
  });
  newLog.save(function (err, data) {
    if (err) console.log(err);
  });
};