var request = require('superagent');
var should = require('should');
var server = require('../app');

describe('Workout', function(){
  before(function(){
    server.listen(5000);
  });
  after(function () {
    server.close();
  });

  it('can create new', function(done){
    var testLifts = [{name:'squat', sets:1, reps:1, weight:1}, {name:'deadlift', sets:1, reps:1, weight:1}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.status.should.equal(201);
      response.body.lifts.should.eql(testLifts);
      done();
    });
  });
  it('include reps, sets & weight', function(done){
    var testLifts = [{name:'squat', reps:5, sets:3, weight:90}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.status.should.equal(201);
      response.body.lifts.should.eql(testLifts);
      done();
    });
  });
  it('can have comment', function(done){
    var comment = 'not bad';
    var workoutData = {lifts:[{name:'squat', reps:1, sets:1, weight:1 }], comment:comment};
    postWorkout(workoutData, function(response){
      response.body.comment.should.equal(comment);
      done();
    });
  });

  it('lifts with 0 sets are not persisted', function(done){
    var testLifts = [{name:'squat', reps:5, sets:0, weight:90}, {name:'squat', reps:5, sets:3, weight:90}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.status.should.equal(201);
      response.body.lifts.should.eql([{name:'squat', reps:5, sets:3, weight:90}]);
      done();
    });
  });

  it('lifts with 0 weight are not persisted', function(done){
    var testLifts = [{name:'squat', reps:5, sets:3, weight:0}, {name:'squat', reps:5, sets:3, weight:90}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.status.should.equal(201);
      response.body.lifts.should.eql([{name:'squat', reps:5, sets:3, weight:90}]);
      done();
    });
  });

  it('lifts with 0 reps are not persisted', function(done){
    var testLifts = [{name:'squat', reps:0, sets:3, weight:90},{name:'squat', reps:5, sets:3, weight:90}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.status.should.equal(201);
      response.body.lifts.should.eql([{name:'squat', reps:5, sets:3, weight:90}]);
      done();
    });
  });

  it('user is persisted', function(done){
    var testLifts = [{name:'squat', reps:0, sets:3, weight:90}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.body.user.should.eql('sala');
      done();
    });
  });

  function postWorkout(data, callback) {
    request.post('http://localhost:5000/workout')
      .set('Content-Type', 'application/json')
      .send(data)
      .auth('sala', 'kala')
      .end(callback);
  }

  describe('querying', function() {
    it('can get latest workout', function(done){
      postWorkout({ lifts: [{name:'squat', reps:1, sets:4, weight:91}] }, function(response) {
        getWorkout(function(response){
          response.status.should.equal(200);
          response.body[0].weight.should.equal(91);
          done();
        });
      });
    });

    it('returns latest weight for all lifts', function(done){
      var squat = {name:'squat', reps:1, sets:4, weight:92};
      var deadlift = {name:'deadlift', sets:1, reps:1, weight:101};
      var bench = {name:'bench', sets:1, reps:1, weight:82};
      var press = {name:'press', reps:1, sets:4, weight:12};
      var clean = {name:'clean', sets:1, reps:1, weight:11};

      postWorkout({ lifts: [squat, deadlift, bench ] }, function(response) {
        postWorkout({ lifts: [press, clean ] }, function(response) {
          getWorkout(function(response){
            response.status.should.equal(200);
            var lifts = response.body;

            lifts.should.containEql(squat);
            lifts.should.containEql(deadlift);
            lifts.should.containEql(bench);
            lifts.should.containEql(clean);
            lifts.should.containEql(press);
            done();
          });
        });

      });
    });


    function getWorkout(callback) {
      request.get('http://localhost:5000/workout/latest')
        //.set('Content-Type', 'application/json')
        //.auth('sala', 'kala')
        .end(callback);
    }
  });
});

describe('User Account', function(){
  before(function(){
    server.listen(5000);
  });
  after(function () {
    server.close();
  });

  it('can create Accounts', function(done){
    request.post('http://localhost:5000/account')
      .send({ username: 'testuser', password: 'cat' })
      .end(function(response){
        response.status.should.equal(201);
        response.body.should.eql('testuser');
        done();
      });
  });
});
