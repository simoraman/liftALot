var request = require('superagent');
var should = require('should');

describe('Workout', function(){

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
});

describe('User Account', function(){
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
