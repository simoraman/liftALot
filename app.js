var restify = require('restify');
var mongo = require('mongodb');
var monk = require('monk');
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/workout';
var db = monk(mongoUri);
this.server = restify.createServer({ name: 'lift-alot-api' });
var _ = require('lodash');
var passport = require('passport');
var BasicStrategy = require('passport-http').BasicStrategy;
var bcrypt = require('bcrypt-nodejs');
var Bacon = require('baconjs');

exports.listen = function () {
  this.server.listen.apply(this.server, arguments);
};

exports.close = function (callback) {
  this.server.close(callback);
};

this.server
  .use(restify.fullResponse())
  .use(restify.bodyParser())
  .use(passport.initialize())
  .use(function(req,res,next){
    req.db = db;
    next();
  });

passport.use(new BasicStrategy(function(username, password, done){
  var collection = db.get('accountcollection');
  collection.findOne({user:username}, function(err, account){
    if(err) return done(null, false);
    if(bcrypt.compareSync(password, account.password)) {
      return done(null, { username: username });
    };
    return done(null, false);
  });
}));

//restify's serveStatic is somehow broken
this.server.get('/signup', function(req, res){
  fs = require('fs');
  fs.readFile('./public/signup/signup.html', 'utf8', function (err, html) {
    res.writeHead(200, {
      'Content-Length': Buffer.byteLength(html),
      'Content-Type': 'text/html'
    });
    res.write(html);
    res.end();
  });
});

this.server.post('/workout',passport.authenticate('basic', { session: false }), function(req, res, next) {
  var lifts = req.body.lifts;
  lifts = _.select(lifts, function(lift){
    return lift.sets > 0 && lift.weight > 0 && lift.reps > 0;
  });
  var db = req.db;
  var collection = db.get('workoutcollection');
  collection.insert({lifts:lifts, comment:req.body.comment, user:req.user.username, date: new Date()}, function(err, workout){
    res.send(201, workout);
  });
});

this.server.get('/workout', passport.authenticate('basic', { session: false }), function(req, res) {
  var db = req.db;
  var collection = db.get('workoutcollection');
  collection.find({}, function(err, result){
    res.send(200, result);
  });
});

this.server.get('/workout/latest', function(req, res){
  var db = req.db;
  var collection = db.get('workoutcollection');

  collection.distinct('lifts.name', function(err, lifts){
    var results = [];
    _.forEach(lifts, function(lift){
      var findPromise = collection.findOne({'lifts.name' : lift}, { sort : [['date','desc']] });
      var stream = Bacon.fromPromise(findPromise).map(function(result){
        return _.filter(result.lifts, function(v){ return v.name===lift; });
      });
      results.push(stream);
    });
    Bacon.combineAsArray(results).onValue(function(lf){
      res.send(200, _.flatten(lf));
    });
  });

});

this.server.post('/account', function(req, res){
  var db = req.db;
  var collection = db.get('accountcollection');
  collection.insert({user:req.params.username, password:bcrypt.hashSync(req.params.password)}, function(err, account){
    res.send(201, account.user);
  });
});

this.server.get(/.*/,passport.authenticate('basic', { session: false }), restify.serveStatic({
  directory: './public',
  default: 'index.html',
  maxAge:0
}));
