// Global phrases
// Where possible should match the error codes

module.exports = {
  success: '👍 Done.',
  generalMisundertanding: '😕 Sorry don\'t understand. Type \'packhack\' for help.',
  listNotFound: '😕 Sorry, couldn\'t find %#list.',
  personNotFound: '😕 Sorry, couldn\'t find %@person in your pack.',
  suggestGetLists: 'Type \'get lists\' to see what\'s available.',
  noList: '😕 Sorry please specify a list.\n%%commandSpecificSuggestion',
  noPerson: '😕 Sorry please specify a person to send that to.\n%%commandSpecificSuggestion',
  generalError: '😬 Sorry something unexpected happened.\nPlease try again.',
  notRegistered: 'Sorry, don\'t see you as a member of a pack.\nPlease register.',
  // getList specifc
  noItems: 'Currently no items in %#list.',
  // getLists specific
  noListsExist: '🤔 No lists exist.  Perhaps create one?',
  // editLists specific
  editListRemoveSuggestion: 'Use \'remove\' followed by item numbers separated by commas, periods or double-spaces.\ne.g. \'remove 1,2,3\'',
  // createList specific
  listAlreadyExists: '😕 Sorry, %#list already exists!',
  listNameInvalid: '😕 Sorry, list name is invalid.\nPlease don\'t use spaces or reserved commands like \'create\'.',
  // addListItem or removeListItem specific
  noListItemToAdd: '😕 Sorry, please specify item(s) to add.',
  noListItemToRemove: '😕 Sorry, please specify item(s) to remove.',
  listItemNotFound: '😕 Sorry, couldn\'t find ',
  suggestGetPartOne: 'Type \'get ',
  suggestGetPartTwo: '\' to see items in the list.',
  listItemIndexNotFound: '😕 Sorry, couldn\'t find number ',
  suggestEditPartOne: 'Type \'edit ',
  suggestEditPartTwo: '\' to see numbered items in the list.',
  // clearList specific
  listAlreadyClear: '🤔 Hmmm...\nLooks like %#list is already clear.',
  // sendList specific
  justSent: '%@fromPerson just sent you %#list:',
  smsError: '😕 Sorry, send failure.\nPlease try again.',
  // addReminder specific
  noDateTime: '😕 Sorry, couldn\'t work out that time.\nTry a date, day of week, time, phrases such as tomorrow or next week, or any combo.',
  noTitle: '😕 Sorry, couldn\'t work out a reminder title.\nTry ending one to the end.\ne.g. \'remind @someone tomorrow go shopping\'',
  addReminderSuccess: '👍 Set for %%date.',
  dateTimePast: '😕 Sorry, can\'t add a reminder in the past',
  // help
  help: '🐺 Welcome to PackHack.\nCo-ordinate your pack.\n\nUse the following commands:\n• get -OR- get lists\n• create list\n• get #list or just \'list\'\n• #list add item -OR - just \'add item\' to recent list\n• #list remove item -OR- just \'remove item\' to recent list\n• clear #list\n• delete #list\n• remind - use the format \'remind @who when what',
  // push intro
  pushIntro: 'Congrats - you\'ve just been signed up for PackHack!\nA better way to co-ordinate your pack.\nType \'hack\' for help',
  // command specific exmaples
  createListExample: 'e.g. \'create shopping\'',
  getListExample: 'e.g. \'get #shopping\', or simply \'shopping\'',
  editListExample: 'e.g. \'edit #shopping\', or \'edit shopping\'',
  deleteListExample: 'e.g. \'delete shopping\'',
  addListItemExample: 'e.g. \'#shopping add bread, milk, coffee\'.\nOr simply, \'get shopping\', followed by \'add bread, milk, coffee\'.',
  removeListItemExample: 'e.g. \'#shopping remove apples and oranges\'.\nOr simply, \'get shopping\', followed by \'remove apples and oranges\'.\nAlternatively, can use edit shopping, followed by remove 1,2 to remove numbered items.',
  clearListExample: 'e.g. \'clear shopping\'',
  sendListExample: 'e.g. \'send @bob shopping\'\nor \'send all #shopping\'',
  addReminderExample: 'Use the format remind @who what when\ne.g. \'remind bob get milk tomorrow\'\nor \'remind @me walk dog thursday morning\'',
  helpExmaple: 'e.g. \'packhack\' for help',
  pushIntroExample: 'e.g. \'**welcome bob 2\',\nwhere 2 is the Pack ID.'
}
