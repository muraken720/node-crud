
/**
 * Module dependencies.
 */
var express = require('express')
  , mongoose = require('mongoose')
  , mongodb = require('mongodb')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Model

var ObjectId = mongodb.BSONPure.ObjectID;
var Schema = mongoose.Schema;

var Memo = new Schema({
  content : String,
  date : Date
});

Memo.pre('save', function(next) {
  this.date = new Date();
  next();
});

mongoose.model('memo', Memo);

var db = mongoose.createConnection('mongodb://localhost/memo');
var Memo = db.model('memo');

app.configure(function() {
  app.set('db', db);
});


// Routes

app.get('/memo', function(req, res) {
  console.log("index");
  Memo.find({}, function(err, data) {
    if(err) return next(err);
    res.render('index', { memos: data });
  });
});

app.get('/memo/list', function(req, res, next) {
  console.log("get memos");
  Memo.find({}, function(err, data) {
    if(err) return next(err);
    res.json(data);
  });
});

app.get('/memo/:id', function(req, res, next) {
  console.log("get memo : " + req.params.id);
  Memo.findById({ _id : ObjectId(req.params.id)}, function(err, data) {
    if(err) return next(err);
    res.json(data);
  });
});

app.post('/memo', function(req, res, next) {
  console.log("post memo : " + req.body.content);
  var memo = new Memo();
  memo.content = req.body.content;
  memo.save(function(err) {
    if(err) return next(err);
    res.json({ message : 'Success!'});
  });
});

app.put('/memo/:id', function(req, res, next) {
  console.log("put memo : " + req.params.id);
  Memo.update(
    { _id : ObjectId(req.params.id) }
    , { content : req.body.content, date : new Date() }
    , { upsert : false, multi : false }
    , function(err) {
      if(err) return next(err);
      res.json({ message : 'Success!'});
  });
});

app.del('/memo/:id', function(req, res, next) {
  console.log("delete memo : " + req.params.id);
  Memo.findById({ _id : ObjectId(req.params.id)}, function(err, data) {
    if(err) return next(err);
    data.remove(function(err) {
      console.log("memo remove!");
      res.json({ message : 'Success!'});
    });
  });
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
