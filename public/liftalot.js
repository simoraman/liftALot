$(document).ready(function(){
  if(localStorage['liftData']){
    setLiftData();
  }
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
  localStorage['liftData'] = JSON.stringify({lifts: getLiftData()});
}

function increase(event){
  valueElement = $(event.target.parentElement).find('input');
  value = parseInt(valueElement.val());
  valueElement.val(value + 1);
}
function decrease(event){
  valueElement = $(event.target.parentElement).find('input');
  value = parseInt(valueElement.val());
  if(value > 0){
    valueElement.val(value - 1);
  }
}

function setLiftData(){
  var liftData = JSON.parse(localStorage['liftData']);
  _.forEach(liftData.lifts, function(lift){
    var $fields = $('.name:contains("' + lift.name + '")').siblings();
    $fields.find('.sets').val(lift.sets);
    $fields.find('.reps').val(lift.reps);
    $fields.find('.weight').val(lift.weight);
  });
}

function getLiftData(){
  var liftList = $('#lift-list li');
  return _.map(liftList, function(el) {
    return {
      name : $(el).find('.name').text(),
      sets : $(el).find('.sets').val(),
      reps : $(el).find('.reps').val(),
      weight : $(el).find('.weight').val()
    };
  });
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
