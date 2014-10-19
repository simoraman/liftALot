$(document).ready(function(){
  var router = window.router();
  window.addEventListener('hashchange', router.route);
  router.route();
});

function router() {
  var route = function () {
    switch (window.location.hash) {
    case '#!/workouts':
      workoutsView().render();
      break;
    default:
      mainView().render();
      break;
    }
  };
  return { route: route };
}
var workoutsView = function(){
  var render = function(){
    Bacon.fromPromise($.getJSON('/workout')).onValue(function(value){
      $('.content').empty();
      var templateStr = ['<div id="{{_id}}" class="workout">'
                         ,'<h3>{{date}}</h3>'
                         ,'</div>'].join('');
      var template = Hogan.compile(templateStr);
      _.each(value, function(item){
        $('.content').append(template.render(item));
        createWorkoutView(item, $('#' + item._id));
      });
    });
  };
  var createWorkoutView = function(workout, parentElement){
    var templateStr = ['<div class="lift">',
                       '{{lift.name}} ',
                       '{{lift.sets}} x {{lift.reps}} @ {{lift.weight}}',
                      '</div>'].join('');
    var template = Hogan.compile(templateStr);
    _.each(workout.lifts, function(lift){
      parentElement.append(template.render({lift: lift}));
    });
  };
  return { render: render };
};

var mainView = function(){
  var render = function() {
    var mainHtml = ['<h3>Lifts:</h3>'
                    ,'<ul id="lift-list">'
                    ,'<li><legend>Comment</legend>'
                    ,'<div class="pure-control-group pure-g">'
                    ,'<textarea name="comment" id="comment" rows="5" cols="50"></textarea>'
                    ,'</div></li></ul>'
                    ,'<button id="save-workout" class="pure-button pure-button-primary">Save workout</button>'].join('');
    $('.content').html(mainHtml);
    var liftNames = ['clean', 'press', 'deadlift', 'bench', 'squat'];
    _.forEach(liftNames, function(liftName){
      $('#lift-list').prepend(createLiftView(liftName));
    });

    if(localStorage['liftData']){
      var liftData = JSON.parse(localStorage['liftData']);
      setLiftData(liftData);
    } else{
      $.getJSON('/workout/latest', function(data){
        var lastWeights = _.forEach(data, function(lift){
          lift.sets = 0;
          lift.comment='';
        });
        var liftData = {lifts: lastWeights};
        localStorage['liftData'] = JSON.stringify(liftData);
        setLiftData(liftData);
      });
    };

    $('#save-workout').asEventStream('click')
      .onValue(saveWorkout);

    $('.add').asEventStream('click')
      .doAction(".preventDefault")
      .doAction(increase)
      .onValue(persistLocally);

    $('.remove').asEventStream('click')
      .doAction(".preventDefault")
      .doAction(decrease)
      .onValue(persistLocally);

    $('.weight').asEventStream('keyup')
      .debounce(500)
      .onValue(persistLocally);

    $('.weight').asEventStream('change')
      .debounce(500)
      .onValue(persistLocally);

    $('#comment').asEventStream('keyup')
      .debounce(500)
      .onValue(persistLocally);

  };
  return{ render: render };
};

function persistLocally() {
  localStorage['liftData'] = JSON.stringify(getLiftData());
}

function increase(event){
  var valueElement = $(event.target.parentElement).find('input');
  var value = parseInt(valueElement.val());
  valueElement.val(value + 1);
}
function decrease(event){
  var valueElement = $(event.target.parentElement).find('input');
  var value = parseInt(valueElement.val());
  if(value > 0){
    valueElement.val(value - 1);
  }
}

function setLiftData(liftData){
  _.forEach(liftData.lifts, function(lift){
    var $fields = $('#' + lift.name).siblings();
    $fields.find('.sets').val(lift.sets);
    $fields.find('.reps').val(lift.reps);
    $fields.find('.weight').val(lift.weight);
  });
  $('#comment').val(liftData.comment);
}

function getLiftData(){
  var liftList = $('#lift-list li');
  var lifts =  _.map(liftList, function(el) {
    return {
      name : $(el).find('.name').attr('id'),
      sets : $(el).find('.sets').val(),
      reps : $(el).find('.reps').val(),
      weight : $(el).find('.weight').val()
    };
  });
  var liftData = {};
  liftData.lifts = lifts;
  liftData.comment = $('#comment').val();
  return liftData;
}
function saveWorkout() {
  $.ajax('/workout', {
    data : localStorage['liftData'],
    contentType : 'application/json',
    type : 'POST'
 }).done(function(){
   localStorage.clear();
   location.reload();
 });
}
function createLiftView(lift){
  var templateStr = [
  '<li>',
   '<form class="pure-form pure-form-aligned">',
    '<legend class="name" id="{{lift}}">{{liftTitle}}</legend>',
     '<fieldset>',
      '<label>Sets</label>',
      '<div class="pure-control-group pure-g">',
       '<button class="remove pure-button pure-u-1-5">-</button>',
       '<input type="number" class="sets pure-u-2-5" value="0" min="0"></input>',
       '<button class="add pure-button pure-u-1-5">+</button>',
      '</div>',
      '<label>Reps</label>',
      '<div class="pure-control-group pure-g">',
       '<button class="remove pure-button pure-u-1-5">-</button>',
       '<input type="number" class="reps pure-u-2-5" value="5" min="0"></input>',
       '<button class="add pure-button pure-u-1-5">+</button>',
      '</div>',
      '<label>Weight</label>',
      '<div class="pure-control-group pure-g">',
       '<input type="number" class="weight pure-u-2-5" step="0.5" min="0" value=""></input>',
      '</div>',
     '</fieldset>',
    '</form>',
  '</li>'].join('');
  var template = Hogan.compile(templateStr);
  return template.render({lift:lift, liftTitle:lift.charAt(0).toUpperCase() + lift.slice(1)});
}
