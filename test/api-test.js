var request = require('superagent');
var should = require('should');

describe('Workout', function(){
  var testLifts = [{name:'squat'}, {name:'bench'}, {name:'deadlift'}];
  it('can create new', function(done){
    request.post('http://localhost:5000/workout')
      .set('Content-Type', 'application/json')
      .send({ lifts: testLifts })
      .end(function(response) {
        response.status.should.equal(201);
        response.body.lifts.should.eql(testLifts);
        done();
      });
  });
  afterEach(function(done) {
    done();
  });
});
