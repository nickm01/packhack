// Next Steps: Add to heroku


var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var app = express();
var currentDB;
var mongoOp = require("./model/mongo");
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({"extended" : false}));

app.set('port', (process.env.PORT || 5000));

router.get("/",function(req,res){
    res.json({"error" : false,"message" : "Hello World 123"});
});


router.route("/types")
    .get(function(req,res){
        var response = {};
        mongoOp.find({},function(err,data){
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
        db.itemKey = req.body.itemKey; 
        db.itemName = req.body.itemName;
        db.save(function(err){
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
        mongoOp.findOne({ 'itemKey': req.params.id},function(err,data){
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
        mongoOp.findOne({ 'itemKey': req.params.id},function(err,data){
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