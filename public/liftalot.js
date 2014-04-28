$(document).ready(function(){
  $('#save-workout').asEventStream('click')
    .onValue(saveWorkout);
  $('.add').asEventStream('click')
    .doAction(".preventDefault")
    .doAction(persistLocally)
    .onValue(increase);
  $('.remove').asEventStream('click')
    .doAction(".preventDefault")
    .doAction(persistLocally)
    .onValue(decrease);
  $('.weight').asEventStream('keyup')
    .debounce(500)
    .onValue(persistLocally);
});

function persistLocally(a,b){
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
 });
}
