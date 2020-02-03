// Global user-facing errors (not to be confused with DB or model errors)

const errorTypes = {
  noText: 'noText',
  notRegistered: 'notRegistered',
  unrecognizedCommand: 'unrecognizedCommand',
  noList: 'noList',
  listNameInvalid: 'listNameInvalid',
  noPerson: 'noPerson',
  listAlreadyExists: 'listAlreadyExists',
  listNotFound: 'listNotFound',
  personNotFound: 'personNotFound',
  listItemNotFound: 'listItemNotFound',
  smsError: 'smsError',
  generalError: 'generalError',
  noDateTime: 'noDateTime',
  noTitle: 'noTitle',
  dateTimePast: 'dateTimePast'
}

module.exports = {
  errorTypes
}
