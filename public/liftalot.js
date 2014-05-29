$(document).ready(function(){
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
});

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
       '<button class="remove pure-button">-</button>',
       '<input type="number" class="sets pure-u-1-5" value="0" min="0"></input>',
       '<button class="add pure-button">+</button>',
      '</div>',
      '<label>Reps</label>',
      '<div class="pure-control-group pure-g">',
       '<button class="remove pure-button">-</button>',
       '<input type="number" class="reps pure-u-1-5" value="5" min="0"></input>',
       '<button class="add pure-button">+</button>',
      '</div>',
      '<label>Weight</label>',
      '<div class="pure-control-group pure-g">',
       '<input type="number" class="weight pure-u-1-5" step="0.5" min="0" value=""></input>',
      '</div>',
     '</fieldset>',
    '</form>',
  '</li>'].join('');
  var template = Hogan.compile(templateStr);
  return template.render({lift:lift, liftTitle:lift.charAt(0).toUpperCase() + lift.slice(1)});
}
