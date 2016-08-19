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
  console.log('----Twilio From: ' + req.param('From'));
  console.log('----Twilio Message: ' + req.param('Body'));
  var bodyText = req.param('Body');
  var fromPhoneNumber = req.param('From');
  var response = false;
  var familyId = 0;

        //Check FamilyId
        mongoOp.FamilyMembers.findOne({'phoneNumber': fromPhoneNumber }, 'familyId', function (err, familyMember) {
          if (familyMember == null) {
            var twilioResponse = new twilio.TwimlResponse();
            twilioResponse.message("Sorry, don't see you as a member of a family.");
            res.send(twilioResponse.toString());
          } else {
            familyId = familyMember.familyId;
            console.log('----familyId: ' + familyId);

            if (bodyText.toLowerCase() === "get lists") {
              response = true;
              mongoOp.Lists.find({'familyId':familyId}, 'listKey', function(err, lists){
                if(err){
                 console.log(err);
               } else{
                var concatText = "";
                
                lists.forEach(function(list){
                  concatText = concatText.concat('\n' + list.listKey);
                });
                var twilioResponse = new twilio.TwimlResponse();
                twilioResponse.message('\nLists:'+ concatText);
                res.send(twilioResponse.toString());
              }
            });

            } else if (bodyText.toLowerCase().startsWith("get #")) {
              console.log('*** get list!!!!');
              response = true;
              var listName = bodyText.substr(5).toLowerCase();

              mongoOp.ListItems.find({'listKey':listName}, function(err, listItems){
                if(err){
                  //TODO; Better error checking
                  console.log(err);
                } else {
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
                  var twilioResponse = new twilio.TwimlResponse();
                  twilioResponse.message('\n'+ listName + ':' + concatText);
                  res.send(twilioResponse.toString());
                }
              });

            } else if (bodyText.toLowerCase().startsWith("#")) {

              var listName = getFirstWord(bodyText).substr(1);
              mongoOp.Lists.findOne({'listKey': listName}, 'listKey', function(err, list) {
                console.log('----list found' + list);

                if (list == null) {
                  var twilioResponse = new twilio.TwimlResponse();
                  twilioResponse.message('Unknown list!');
                  res.send(twilioResponse.toString());
                } //else {
                //db.users.insert({ name : 'Arvind', gender : 'male'});
                //}
              });
          }


        }

        //Fallback to if nothing hits
        if (response == false) {
          var twilioResponse = new twilio.TwimlResponse();
          twilioResponse.message("Sorry, come again?");
          res.send(twilioResponse.toString());
        }

      }
    })

});          


app.use('/',router);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function sendSMSResponse(messageText,response) {
  var twilioResponse = new twilio.TwimlResponse();
  twilioResponse.message(messageText);
  response.send(twilioResponse.toString());
  console.log('----SendSMSResponse Text: ' + messageText);
};

function getFirstWord(str) {
  if (str.indexOf(' ') === -1)
    return str;
  else
    return str.substr(0, str.indexOf(' '));
};