var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mongoOp = require("./model/mongo");
var router = express.Router();
var config = require('./config');
var twilio = require('twilio');
var sendSms = require('./sendsms');
var cookieParser = require('cookie-parser');
var logging = require('./logging');
var reminders = require('./reminders');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

var app = express();
app.use(cookieParser());

app.set('port', (process.env.PORT || 5000));

router.get("/",function(req,res){
  res.json({"error" : false,"message" : "available"});
});

router.route("/twilio")
.get(function(req,res){
  console.log('----Twilio From: ' + req.query['From'] + ' Message ' + req.query['Body']);
  var bodyText = req.query['Body'].toLowerCase();
  var fromPhoneNumber = req.query['From'];
  var familyId = 0;

  var cachedListName;
  if (req.cookies !== undefined && req.cookies.listName !== undefined) {
    cachedListName = req.cookies.listName;
    if (bodyText.startsWith("add ") || bodyText.startsWith("remove ")) {
      bodyText = '#' + cachedListName + ' ' + bodyText;
      console.log('add command changed to ' + bodyText);
    }
  }

  //Check FamilyId
  mongoOp.FamilyMembers.findOne({'phoneNumber': fromPhoneNumber }, 'familyId', function (err, familyMember) {
    if (familyMember == null) {
      sendSMSResponse(fromPhoneNumber, 0, bodyText, "Sorry, don't see you as a member of a family.", res);  
    } else {
      familyId = familyMember.familyId;
      logging.log(fromPhoneNumber, familyId, bodyText, "request", "");

      //MAIN LOGIC
      if (bodyText === "get lists" || bodyText === "get" || bodyText === "lists") {
        response = true;
        mongoOp.Lists.find({'familyId':familyId}, 'listKey', function(err, lists) {
          if(err){
            logging.logError(fromPhoneNumber, familyId, bodyText, err);
          } else {
            var concatText = "";
                
            lists.forEach(function(list){
              concatText = concatText.concat('\n#' + list.listKey);
            });
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, concatText, res);
          }
        });

      // } else if (bodyText === "fix")  {
      //   mongoOp.ListItems.find({},function(err,listItems) {
      //     listItems.forEach(function(listItem){
      //       listItem.familyId = 1;
      //       listItem.save(function(err){
      //         if(err) {
      //           console.log('---->>>> fix error');
      //         } else {
      //           console.log('---->>>> fix SUCCESS!!!!');
      //         }
      //       });
      //     });
      //   });


      // Basic welcome message
      } else if (bodyText.startsWith("** welcome ")) {
        response = true;
        var welcomeSendUserId = bodyText.substr(11);
        console.log('*** Send welcome to ' + welcomeSendUserId);
        mongoOp.FamilyMembers.findOne({'userId': welcomeSendUserId}, 'phoneNumber', function(err, familyMember) {
          sendSms.sendSms(familyMember.phoneNumber,'Welcome to FLOCK!\nYou now have the power to crowdsource your family lists. \nLearn more - text the word “flock” to this number to see a list of available commands.\nHave fun!\n❤️FLOCK', function(){});
          sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Welcome sent to ' + familyMember.phoneNumber, res);
        });

      // Get list items
      } else if (bodyText.startsWith("get #")) {
        console.log('*** get list!!!!');
        response = true;
        var listName = bodyText.substr(5);

        mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {
          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, '#' + listName + ' does not exist.', res);
          } else {
            mongoOp.ListItems.find({'listKey':listName, 'familyId': familyId}, function(err, listItems){
              if(err){
                logging.logError(fromPhoneNumber, familyId, bodyText, err);
              } else {
                var concatText = "";
                var itemNumber = 0;
                listItems.forEach(function(listItem){
                  itemNumber++;
                  concatText = concatText.concat('\n• ' + listItem.listItemName);
                });
                if (itemNumber == 0) {
                  concatText = concatText.concat('No items in #' + listName + '.');
                }
                cacheListName(listName,res);
                sendSMSResponse(fromPhoneNumber, familyId, bodyText, '\n#'+ listName + ':' + concatText, res);
             }
            });
          }
        });

      } else if (bodyText.startsWith('#')) {

        var listName = getFirstWord(bodyText).substr(1);
        mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {

          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, '#' + listName + ' does not exist.', res);
          } else {
            var addVerbPhrase = '#' + listName + ' add ';
            var removeVerbPhrase = '#' + listName + ' remove ';

            //Add item
            if (bodyText.startsWith(addVerbPhrase)) {
              var listItemName = bodyText.substr(addVerbPhrase.length);
              
              var newItem = new mongoOp.ListItems({
                "listKey" : listName,
                "listItemName" : listItemName,
                "familyId" : familyId
              });
              newItem.save(function (err, data) {
                if (err) logging.logError(fromPhoneNumber, familyId, bodyText, err);
                else {
                  console.log('----saved ', data );
                  cacheListName(listName,res);
                  sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);  
                }
              });

            //Remove list item
            } else if (bodyText.startsWith(removeVerbPhrase)) {
              var listItemName = bodyText.substr(removeVerbPhrase.length);

              mongoOp.ListItems.remove({"listKey" : listName,"listItemName" : listItemName, 'familyId': familyId}, function(err, removeResult) {
                if (err) {
                  logging.logError(fromPhoneNumber, familyId, bodyText, err);
                  return;
                }
                console.log('----removed ' + listItemName + ' ' + removeResult.result.n);
                if (removeResult.result.n === 0) {
                  sendSMSResponse(fromPhoneNumber, familyId, bodyText, listItemName + " doesn't exist in #" + listName + ".", res); 
                } else {
                  sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);  
                }
              });
            }

          }
        });

      // Create list.
      } else if (bodyText.startsWith('create #')) {
        var newListName = bodyText.substr(8)
        mongoOp.Lists.findOne({'listKey': newListName, 'familyId': familyId}, 'listKey', function(err, list) {

          if (list != null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'List already exists!', res);  
          } else {

            if (newListName.includes(' ')) {
              sendSMSResponse(fromPhoneNumber, familyId, bodyText, "Sorry, but please don't include spaces in list names.", res);  
              return;
            }

            var newList = new mongoOp.Lists({
              "listKey" : newListName,
              "listDescription" : "",
              "familyId" : familyId
            });
            newList.save(function (err, data) {
              if (err) logging.logError(fromPhoneNumber, familyId, bodyText, err);
              else {
                console.log('----saved ', data );
                cacheListName(newListName,res);
                sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);  
              }
            });
          }
        });

      // Clear list.
      } else if (bodyText.startsWith('clear #')) {
        var listName = bodyText.substr(7)
        mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {

          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, '#' + listName + ' does not exist.', res);
          } else {

            mongoOp.ListItems.remove({"listKey" : list.listKey, 'familyId': familyId}, function(err, removeResult) {
              if (err) {
                logging.logError(fromPhoneNumber, familyId, bodyText, err);
                return;
              }
              console.log('----cleared ' + list.listKey + ' ' + removeResult.result.n);
              if (removeResult.result.n === 0) {
                sendSMSResponse(fromPhoneNumber, familyId, bodyText, "#" + list.listKey + " already empty.", res); 
              } else {
                sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);  
              }
            });

          }

        });

      // delete list.
      } else if (bodyText.startsWith('delete #')) {
        var listName = bodyText.substr(8)
        
        mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {
          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, '#' + listName + ' does not exist.', res);
          } else {
            
            mongoOp.Lists.remove({"listKey" : list.listKey, 'familyId': familyId}, function(err, removeResult) {
              if (err) {
                logging.logError(fromPhoneNumber, familyId, bodyText, err);
                return;
              }
              console.log('----deleted ' + list.listKey + ' ' + removeResult.result.n);
              sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);    
            });
          }
        });

      // send list
      } else if (bodyText.startsWith('send @')) {
        var messageCommandRemoved = bodyText.substr(6);
        var userName = getFirstWord(messageCommandRemoved);
        var listName = bodyText.substr(6 + userName.length + 2); //will strip out #
        console.log('send message to ' + userName + ' list: ' + listName);
        mongoOp.FamilyMembers.findOne({'name': userName, 'familyId': familyId}, 'phoneNumber', function(err, familyMember) {
          if (err) {
            logging.logError(fromPhoneNumber, familyId, bodyText, err);
            return;
          }

          mongoOp.FamilyMembers.findOne({'phoneNumber': fromPhoneNumber, 'familyId': familyId}, 'name', function(err, fromFamilyMember) {
            if (err) {
              logging.logError(fromPhoneNumber, familyId, bodyText, err);
              return;
            }

            // Centralize!
            mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {
              if (list == null) {
                sendSMSResponse(fromPhoneNumber, familyId, bodyText, '#' + listName + ' does not exist.', res);
              } else {
                mongoOp.ListItems.find({'listKey':listName, 'familyId': familyId}, function(err, listItems){
                  if(err){
                    logging.logError(fromPhoneNumber, familyId, bodyText, err);
                  } else {
                    console.log(familyMember);
                    var concatText = "";
                    listItems.forEach(function(listItem){
                      concatText = concatText.concat('\n• ' + listItem.listItemName);
                    });
                    cacheListName(listName,res);
                    sendSms.sendSms(familyMember.phoneNumber, "\n@" + fromFamilyMember.name + " sent you #"+ listName + ":" + concatText + "\nType 'get #" + listName + "'' to retrieve later.", function(){});
                    sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);
                  }
                });
              }
            });
          });
        });

      // remind @nick some text date
      } else if (bodyText.startsWith('remind @')) {
        var remindText = bodyText.substr(8)
        reminders.addReminder(remindText,familyId, function(err){
          if (err == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);            
          } else {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, err, res);                        
          }
        });

      // help
      } else if (bodyText === 'flock') {
        sendSMSResponse(fromPhoneNumber, familyId, bodyText, "Welcome to ❤️FLOCK\nThe Family Operating System\n\nUse the following commands:\n• get -OR- get lists\n• create #list\n• get #list\n• #list add item -OR - just 'add item' if already got list\n• #list remove item -OR- just 'remove item' if already got list\n• clear #list\n• delete #list", res);

      // catch all        
      } else {
        sendSMSResponse(fromPhoneNumber, familyId, bodyText, "Sorry, don't understand.  Type 'flock' for more info.", res);    
      }

    } 
  });
});          


app.use('/',router);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function sendSMSResponse(phoneNumber, familyId, inMessage, outMessage, response) {
  var twilioResponse = new twilio.TwimlResponse();
  twilioResponse.message(outMessage);
  response.send(twilioResponse.toString());
  logging.log(phoneNumber, familyId, inMessage, "response", outMessage);
};

function cacheListName(listName,response) {
  response.cookie('listName', listName, { maxAge: 1000 * 60 * 60 });
};

function getFirstWord(str) {
  if (str.indexOf(' ') === -1)
    return str;
  else
    return str.substr(0, str.indexOf(' '));
};