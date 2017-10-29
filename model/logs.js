const logsPromises = require('./logs.promises')
const modelConstants = require('./modelconstants')

const saveNewPromise = (data) => {
  let type = ''
  if (data.errorMessage) {
    type = 'error'
  } else if (data.responseText) {
    type = 'response'
  } else {
    type = 'request'
  }
  return logsPromises.saveNewPromise(data, type)
    .then(value => {
      return data
    }, error => {
      data.errorMessage = modelConstants.errorTypes.generalError
      data.systemError = error
      throw data
    })
}

module.exports = {
  saveNewPromise
}
