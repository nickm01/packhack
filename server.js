var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var app = express();
var currentDB;
var mongoOp = require("./model/mongo");
var router = express.Router();
var twilio = require('twilio');
var cookieParser = require('cookie-parser');

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
      log(fromPhoneNumber, familyId, bodyText, "request", "");

      //MAIN LOGIC
      if (bodyText === "get lists" || bodyText === "get") {
        response = true;
        mongoOp.Lists.find({'familyId':familyId}, 'listKey', function(err, lists) {
          if(err){
            logError(fromPhoneNumber, familyId, bodyText, err);
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

      // Get list items
      } else if (bodyText.startsWith("get #")) {
        console.log('*** get list!!!!');
        response = true;
        var listName = bodyText.substr(5);

        mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {
          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, listName + 'does not exist.', res);
          } else {
            mongoOp.ListItems.find({'listKey':listName, 'familyId': familyId}, function(err, listItems){
              if(err){
                logError(fromPhoneNumber, familyId, bodyText, err);
              } else {
                var concatText = "";
                var itemNumber = 0;
                listItems.forEach(function(listItem){
                  itemNumber++;
                  concatText = concatText.concat('\n• ' + listItem.listItemName);
                });
                if (itemNumber == 0) {
                  concatText = concatText.concat(' No items in list.');
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
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, listName + 'does not exist.', res);
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
                if (err) logError(fromPhoneNumber, familyId, bodyText, err);
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
                  logError(fromPhoneNumber, familyId, bodyText, err);
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
              if (err) logError(fromPhoneNumber, familyId, bodyText, err);
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
        var newListName = bodyText.substr(7)
        mongoOp.Lists.findOne({'listKey': newListName, 'familyId': familyId}, 'listKey', function(err, list) {

          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'List does not exist', res);  
          } else {

            mongoOp.ListItems.remove({"listKey" : list.listKey, 'familyId': familyId}, function(err, removeResult) {
              if (err) {
                logError(fromPhoneNumber, familyId, bodyText, err);
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
        var newListName = bodyText.substr(8)
        
        mongoOp.Lists.findOne({'listKey': newListName, 'familyId': familyId}, 'listKey', function(err, list) {
          if (list == null) {
            sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'List does not exist', res);  
          } else {
            
            mongoOp.Lists.remove({"listKey" : list.listKey, 'familyId': familyId}, function(err, removeResult) {
              if (err) {
                logError(fromPhoneNumber, familyId, bodyText, err);
                return;
              }
              console.log('----deleted ' + list.listKey + ' ' + removeResult.result.n);
              sendSMSResponse(fromPhoneNumber, familyId, bodyText, 'Got it! ❤️FLOCK', res);    
            });

          }

        });
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
  log(phoneNumber, familyId, inMessage, "response", outMessage);
};

function cacheListName(listName,response) {
  response.cookie('listName', listName, { maxAge: 1000 * 60 * 60 });
};

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

function getFirstWord(str) {
  if (str.indexOf(' ') === -1)
    return str;
  else
    return str.substr(0, str.indexOf(' '));
};