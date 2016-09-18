var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var app = express();
var currentDB;
var mongoOp = require("./model/mongo");
var router = express.Router();
var twilio = require('twilio');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

app.set('port', (process.env.PORT || 5000));

router.get("/",function(req,res){
  res.json({"error" : false,"message" : "available"});
});

router.route("/twilio")
.get(function(req,res){
  console.log('----Twilio From: ' + req.query['From']);
  console.log('----Twilio Message: ' + req.query['Body']);
  var bodyText = req.query['Body'].toLowerCase();
  var fromPhoneNumber = req.query['From'];
  var familyId = 0;

  console.log('Attempting To Read Cache');
  var cachedListName;
  if (req.cookies.listName !== undefined && !isNaN(body)) {
    cachedListName = req.cookies.listName;
    console.log('----Cached: ' + cachedListName);
  }
  console.log('Finished reading Cache');

  //Check FamilyId
  mongoOp.FamilyMembers.findOne({'phoneNumber': fromPhoneNumber }, 'familyId', function (err, familyMember) {
    if (familyMember == null) {
      sendSMSResponse("Sorry, don't see you as a member of a family.", res);  
    } else {
      familyId = familyMember.familyId;
      console.log('----familyId: ' + familyId);

      //MAIN LOGIC
      if (bodyText === "get lists") {
        response = true;
        mongoOp.Lists.find({'familyId':familyId}, 'listKey', function(err, lists) {
          if(err){
            console.log(err);
          } else {
            var concatText = "";
                
            lists.forEach(function(list){
              concatText = concatText.concat('\n#' + list.listKey);
            });
            sendSMSResponse('\nLists:'+ concatText, res);
          }
        });

      } else if (bodyText.startsWith("get #")) {
        console.log('*** get list!!!!');
        response = true;
        var listName = bodyText.substr(5);

        mongoOp.ListItems.find({'listKey':listName}, function(err, listItems){
          if(err){
            //TODO; Better error checking
            console.log(err);
          } else {
            cacheListName(listName,res);
            var concatText = "";
            console.log('*** Count Items:' + listItems.length);
            var itemNumber = 0;
            listItems.forEach(function(listItem){
              itemNumber++;
              concatText = concatText.concat('\n' + itemNumber + '. ' + listItem.listItemName);
            });
            if (itemNumber == 0) {
              concatText = concatText.concat(' No items in list.');
            }
            sendSMSResponse('\n'+ listName + ':' + concatText, res);
          }
        });

      } else if (bodyText.startsWith('#')) {

        var listName = getFirstWord(bodyText).substr(1);
        mongoOp.Lists.findOne({'listKey': listName, 'familyId': familyId}, 'listKey', function(err, list) {
          console.log('----list found' + list);

          if (list == null) {
            sendSMSResponse('Unknown list!', res);
          } else {
            var addVerbPhrase = '#' + listName + ' add ';
            var removeVerbPhrase = '#' + listName + ' remove ';

            //Add list
            if (bodyText.startsWith(addVerbPhrase)) {
              var listItemName = bodyText.substr(addVerbPhrase.length);
              console.log('----add found for ' + listItemName);

              var newItem = new mongoOp.ListItems({
                "listKey" : listName,
                "listItemName" : listItemName
              });
              newItem.save(function (err, data) {
                if (err) console.log(err);
                else {
                  console.log('Saved ', data );
                  sendSMSResponse('Got it! ❤️FLOCK', res);  
                }
              });

            //Remove list
            } else if (bodyText.startsWith(removeVerbPhrase)) {
              var listItemName = bodyText.substr(removeVerbPhrase.length);
              console.log('----remove found for ' + listItemName);

              mongoOp.ListItems.remove({"listKey" : listName,"listItemName" : listItemName}, function(err, removeResult) {
                if (err) {
                  console.log(err);
                  return;
                }
                console.log('----removed ' + listItemName + ' ' + removeResult.result.n);
                if (removeResult.result.n === 0) {
                  sendSMSResponse("The item doesn't exist.", res); 
                } else {
                  sendSMSResponse('Got it! ❤️FLOCK', res);  
                }
              });
            }

          }
        });

      } else if (bodyText.startsWith('create #')) {
        var newListName = bodyText.substr(8)
        mongoOp.Lists.findOne({'listKey': newListName, 'familyId': familyId}, 'listKey', function(err, list) {

          if (list != null) {
            sendSMSResponse('List already exists!', res);  
          } else {

            if (newListName.includes(' ')) {
              sendSMSResponse("Sorry, but please don't include spaces in list names.", res);  
              return;
            }

            var newList = new mongoOp.Lists({
              "listKey" : newListName,
              "listDescription" : "",
              "familyId" : familyId
            });
            newList.save(function (err, data) {
              if (err) console.log(err);
              else {
                console.log('Saved ', data );
                sendSMSResponse('Got it! ❤️FLOCK', res);  
              }
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

function sendSMSResponse(messageText,response) {
  var twilioResponse = new twilio.TwimlResponse();
  twilioResponse.message(messageText);
  response.send(twilioResponse.toString());
  //console.log('----SendSMSResponse Text: ' + messageText);
};

function cacheListName(listName,response) {
  respone.cookie('listName', listName, { maxAge: 1000 * 60 * 60 });
};

function getFirstWord(str) {
  if (str.indexOf(' ') === -1)
    return str;
  else
    return str.substr(0, str.indexOf(' '));
};