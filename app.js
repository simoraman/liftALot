var restify = require('restify');
var mongo = require('mongodb');
var monk = require('monk');
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/workout';
var db = monk(mongoUri);
var server = restify.createServer({ name: 'lift-alot-api' });
var _ = require('lodash');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;

server.listen(process.env.PORT || 5000, function () {
  console.log('%s listening at %s', server.name, server.url);
});

server
  .use(restify.fullResponse())
  .use(restify.bodyParser())
  .use(passport.initialize())
  .use(passport.authenticate('basic', { session: false })
  .use(function(req,res,next){
    req.db = db;
    next();
  });

passport.use(new BasicStrategy(function(username, password,done){
  if(username==='sala'&&password==='kala') return done(null, {username:username});

  return done(null, false);
}));

server.post('/workout', function(req, res, next) {
  var lifts = req.body.lifts;
  lifts = _.select(lifts, function(lift){
    return lift.sets > 0 && lift.weight > 0 && lift.reps > 0;
  });
  var db = req.db;
  var collection = db.get('workoutcollection');
  collection.insert({lifts:lifts, user:req.user.username}, function(err, workout){
    res.send(201, workout);
  });

});

server.get(/.*/, restify.serveStatic({
  directory: './public',
  default: 'index.html',
  maxAge:0
}));
