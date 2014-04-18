var restify = require('restify');
var mongo = require('mongodb');
var monk = require('monk');
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/workout';
var db = monk(mongoUri);
var server = restify.createServer({ name: 'lift-alot-api' });

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server
  .use(restify.fullResponse())
  .use(restify.bodyParser())
  .use(function(req,res,next){
    req.db = db;
    next();
  });

server.get('/workout', function (req, res, next) {

});

server.post('/workout', function(req, res, next) {
  var db = req.db;
  var collection = db.get('workoutcollection');
  collection.insert({lifts:req.body.lifts}, function(err, workout){
    res.send(201, workout);
  });

});

server.get(/.*/, restify.serveStatic({
  directory: './public',
  default: 'index.html',
  maxAge:0
}));
