$(document).ready(function(){
  if(localStorage['liftData']){
    setLiftData();
  } else{
    $.getJSON('/workout/latest', function(data){
      var lastWeights = _.forEach(data, function(lift){
        lift.sets = 0;
      });
      localStorage['liftData'] = JSON.stringify({lifts: lastWeights});
      setLiftData();
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

function setLiftData(){
  var liftData = JSON.parse(localStorage['liftData']);
  _.forEach(liftData.lifts, function(lift){
    var $fields = $('#' + lift.name).siblings();
    $fields.find('.sets').val(lift.sets);
    $fields.find('.reps').val(lift.reps);
    $fields.find('.weight').val(lift.weight);
  });
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
