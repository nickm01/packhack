const mongoOp = require('./mongo')

const saveNewPromise = (data, type) => {
  const logData = {
    phoneNumber: data.fromPhoneNumber,
    familyId: data.familyId,
    message: data.originalText,
    dateTime: new Date(),
    type: type,
    response: data.responseText
  }
  var newLog = new mongoOp.Logs(logData)
  return newLog.save()
}

module.exports = {
  saveNewPromise
}
