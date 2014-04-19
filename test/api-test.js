var request = require('superagent');
var should = require('should');

describe('Workout', function(){

  it('can create new', function(done){
    var testLifts = [{name:'squat', sets:1}, {name:'bench', sets:1}, {name:'deadlift', sets:1}];
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
    var testLifts = [{name:'squat', reps:5, sets:0, weight:90}];
    postWorkout({ lifts: testLifts }, function(response) {
      response.status.should.equal(201);
      response.body.lifts.should.eql([]);
      done();
    });
  });

  function postWorkout(data, callback) {
    request.post('http://localhost:5000/workout')
      .set('Content-Type', 'application/json')
      .send(data)
      .end(callback);
  }
});
