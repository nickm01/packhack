// Next Steps: Add to heroku


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
    res.json({"error" : false,"message" : "Hello World 123"});
});


router.route("/types")
    .get(function(req,res){
        var response = {};
        mongoOp.ItemTypes.find({},function(err,data){
        // Mongo command to fetch all data from collection.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    })
    .post(function(req,res){
        var db = new mongoOp();
        var response = {};
        // fetch email and password from REST request.
        // Add strict validation when you use this in Production.
        console.log(req.body.itemKey);
        console.log(req.body.itemName);
        console.log(req.body);
        console.log("helloxxx");  
        db.ItemTypes.itemKey = req.body.itemKey; 
        db.ItemTypes.itemName = req.body.itemName;
        db.ItemTypes.save(function(err){
        // save() will run insert() command of MongoDB.
        // it will add new data in collection.
            if(err) {
                response = {"error" : true,"message" : "Error adding data"};
            } else {
                response = {"error" : false,"message" : "Data added"};
            }
            res.json(response);
        });
    });

// this trnaslates to: https://salty-wave-20858.herokuapp.com/types/4
router.route("/types/:id")
    .get(function(req,res){
        var response = {};
        //mongoOp.findById(req.params.id,function(err,data){
        // Use FindOne of findById because wanted to pick a key
        mongoOp.ItemTypes.findOne({ 'itemKey': req.params.id},function(err,data){
        // This will run Mongo Query to fetch data based on ID.
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
                response = {"error" : false,"message" : data};
            }
            res.json(response);
        });
    })
    .put(function(req,res){
        var response = {};
        // first find out record exists or not
        // if it does then update the record
        mongoOp.ItemTypes.findOne({ 'itemKey': req.params.id},function(err,data){
            if(err) {
                response = {"error" : true,"message" : "Error fetching data"};
            } else {
            // we got data from Mongo.
            // change it accordingly.
            // Can only change itemName
                if(req.body.itemName !== undefined) {
                    // case where email needs to be updated.
                    data.itemName = req.body.itemName;
                }
                // save the data
                data.save(function(err){
                    if(err) {
                        response = {"error" : true,"message" : "Error updating data"};
                    } else {
                        response = {"error" : false,"message" : "Data is updated for "+req.params.id};
                    }
                    res.json(response);
                })
            }
        });
      });

router.route("/twilio")
    .get(function(req,res){
        console.log('----Twilio From: ' + req.param('From'));
        console.log('----Twilio Message: ' + req.param('Body'));
        var bodyText = req.param('Body');
        var fromPhoneNumber = req.param('From');
        var response = false
    

        if (bodyText.toLowerCase() === "get lists") {
          response = true;
          mongoOp.Lists.find({}, 'listKey', function(err, lists){
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

        } else if (bodyText.toLowerCase().startsWith("get+#")) {
          console.log('*** get list!!!!');
          response = true;
          var listName = bodyText.substr(5);

          mongoOp.ListItems.find({'itemKey':listName}, function(err, listItems){
            if(err){
             console.log(err);
            } else{
              var concatText = "";
              console.log('*** Count Items:' + lists.length);
              listItems.forEach(function(listItem){
                concatText = concatText.concat('\n- ' + listItem.listItemName);
              });
              var twilioResponse = new twilio.TwimlResponse();
              twilioResponse.message('\n'+ listName + ':' + concatText);
              res.send(twilioResponse.toString());
            }
          });

        }

        //Fallback to if nothing hits
        if (response == false) {
          var twilioResponse = new twilio.TwimlResponse();
          twilioResponse.message("Sorry, come again?");
          res.send(twilioResponse.toString());
        }
        //now general twilio response and send it back

      });          


app.use('/',router);

//app.listen(3000);
//console.log("Listening to PORT 3000");

/*
MongoClient.connect("mongodb://heroku_b8s72bwg:vf37fvdjf2lp6kb742q35da40b@ds011311.mlab.com:11311/heroku_b8s72bwg", function(err, db) {
  if(!err) {	
    console.log("We are connected");
    var collection = db.collection('ItemTypes');
    collection.find().toArray(function(err, items) {
    	console.log(items);
	});
    currentDB = db;
  }
});
*/

/*
app.get('/', function(req, res){ 
  res.send('Message from Nick'); 
});

app.get('/times', function(request, response) {
    var result = ''
    var times = process.env.TIMES || 5
    for (i=0; i < times; i++)
      result += i + ' ';
  response.send(result);
});


app.get('/types', function(request, response) {
  var collection = currentDB.collection('ItemTypes');
  collection.find().toArray(function(err, items) {
	  response.send(items);  	
  });
});
*/

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

function sendSMSResponse(messageText,response) {
  var twilioResponse = new twilio.TwimlResponse();
  twilioResponse.message(messageText);
  response.send(twilioResponse.toString());
  console.log('----SendSMSResponse Text: ' + messageText);

}